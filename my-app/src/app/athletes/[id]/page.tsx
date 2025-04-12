import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface Performance {
  id: number;
  discipline: string;
  value: Decimal;
  date: Date;
  medal?: 'GOLD' | 'SILVER' | 'BRONZE';
}

const formatDecimal = (value: Decimal) => value.toNumber().toFixed(2);

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

export default async function AthletePage({ params }: { params: { id: string } }) {
  const athlete = await prisma.athlete.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      performances: {
        orderBy: { date: 'desc' }
      },
      proof: true
    }
  });

  if (!athlete) notFound();

  const athleteWithRelations = athlete as unknown as AthleteWithRelations;
  const latestByDiscipline = (discipline: string) => 
    athleteWithRelations.performances.find((p: Performance) => p.discipline === discipline);

  const performanceSections = [
    { title: 'Ausdauer', key: 'endurance' },
    { title: 'Kraft', key: 'strength' },
    { title: 'Schnelligkeit', key: 'speed' },
    { title: 'Koordination', key: 'coordination' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{athlete.firstName} {athlete.lastName}</h1>
          <div className="mt-2 text-gray-600">
            {Math.floor((new Date().getTime() - new Date(athlete.birthdate).getTime()) / 3.15576e+10)} Jahre | {athlete.gender}
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full ${
          athlete.proof 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {athlete.proof ? 'Nachweis vorhanden' : 'Nachweis fehlt'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {performanceSections.map((section) => {
          const perf = latestByDiscipline(section.key);
          return (
            <div key={section.key} className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              {perf ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Wert:</span>
                    <span className="font-medium">{formatDecimal(perf.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Datum:</span>
                    <span>{new Date(perf.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medaille:</span>
                    <span className={`${
                      perf.medal === 'GOLD' ? 'text-yellow-500' :
                      perf.medal === 'SILVER' ? 'text-gray-400' : 'text-amber-800'
                    } font-medium`}>
                      {perf.medal}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">Keine Daten vorhanden</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Historische Ergebnisse</h2>
        <div className="space-y-4">
          {athlete.performances.map((perf) => (
            <div key={perf.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{perf.discipline}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(perf.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatDecimal(perf.value)}</div>
                  <span className={`text-sm ${
                    perf.medal === 'GOLD' ? 'text-yellow-500' :
                    perf.medal === 'SILVER' ? 'text-gray-400' : 'text-amber-800'
                  }`}>
                    {perf.medal || '-'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <a
        href={`/athletes/${params.id}/log-performance`}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Neue Leistung erfassen
      </a>
    </div>
  );
}
