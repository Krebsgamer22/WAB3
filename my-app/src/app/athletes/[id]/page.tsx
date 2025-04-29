import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma, Discipline } from '@prisma/client';
import AthletePageContent from './AthletePageContent';

function calculateAge(birthdate: Date): number {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

type Performance = Prisma.PerformanceGetPayload<{
  include: { criteria: true };
}>;

type MedalCriteria = Prisma.MedalCriteriaGetPayload<{
  select: { discipline: true; minAge: true; maxAge: true };
}>;

const formatDecimal = (value: Prisma.Decimal) => value.toNumber().toFixed(2);

interface AthleteWithRelations {
  id: number;
  firstName: string;
  lastName: string;
  birthdate: Date;
  gender: string;
  performances: Performance[];
  proof?: {
    fileType: string;
  };
}

async function getData(id: string) {
  const [athlete, medalCriteria] = await Promise.all([
    prisma.athlete.findUnique({
      where: { id: parseInt(id) },
      include: {
        performances: {
          orderBy: { date: 'desc' },
          include: { criteria: true }
        },
        proof: true
      }
    }),
    prisma.medalCriteria.findMany()
  ]);
  
  return { athlete, medalCriteria };
}

export default async function AthletePage({ params }: { params: { id: string } }) {
  const { athlete, medalCriteria } = await getData(params.id);
  
  if (!athlete) notFound();

  const age = calculateAge(athlete.birthdate);
  const allowedDisciplines = new Set(
    medalCriteria.filter(c => age >= c.minAge && age <= c.maxAge)
      .map(c => c.discipline)
  );

  const athleteWithRelations = athlete as unknown as AthleteWithRelations;
  const latestByDiscipline = (discipline: Discipline) => 
    athleteWithRelations.performances.find((p: Performance) => p.discipline === discipline);

  const performanceSections = [
    { title: 'Ausdauer', key: Discipline.AUSDAUER },
    { title: 'Kraft', key: Discipline.KRAFT },
    { title: 'Schnelligkeit', key: Discipline.SCHNELLIGKEIT },
    { title: 'Koordination', key: Discipline.TECHNIK }
  ].filter(section => allowedDisciplines.has(section.key));

  // Add age warnings for existing performances outside criteria
  const ageWarnings = medalCriteria.filter(criteria => 
    athlete.performances.some(p => p.discipline === criteria.discipline) &&
    (age < criteria.minAge || age > criteria.maxAge)
  );

  return (
    <AthletePageContent 
      params={params}
      athlete={athlete}
      medalCriteria={medalCriteria}
      ageWarnings={ageWarnings}
      performanceSections={performanceSections}
      latestByDiscipline={latestByDiscipline}
      formatDecimal={formatDecimal}
    />
  );
}
