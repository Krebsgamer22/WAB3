"use client";
import { useState } from 'react';
import { Prisma, Discipline, MedalType } from '@prisma/client';
import PerformanceChart from '@/app/components/PerformanceChart';

const formatDecimal = (value: Prisma.Decimal) => value.toNumber().toFixed(2);

interface AthletePageContentProps {
  params: { id: string };
  athlete: {
    id: number;
    firstName: string;
    lastName: string;
    birthdate: Date;
    gender: string;
    performances: Array<{
      id: number;
      value: Prisma.Decimal;
      date: Date;
      discipline: Discipline;
      medal: MedalType | null;
      criteria: {
        minAge: number;
        maxAge: number;
      };
    }>;
    proof?: { fileType: string };
  };
  medalCriteria: Array<{
    discipline: Discipline;
    minAge: number;
    maxAge: number;
  }>;
  ageWarnings: Array<{
    discipline: Discipline;
    minAge: number;
    maxAge: number;
  }>;
  performanceSections: Array<{
    title: string;
    key: Discipline;
  }>;
  latestByDiscipline: (discipline: Discipline) => {
    id: number;
    value: Prisma.Decimal;
    date: Date;
    discipline: Discipline;
    medal: MedalType | null;
    criteria: {
      minAge: number;
      maxAge: number;
    };
  } | undefined;
  formatDecimal: (value: Prisma.Decimal) => string;
}

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

export default function AthletePageContent({ 
  athlete,
  medalCriteria,
  ageWarnings,
  performanceSections,
  latestByDiscipline,
  formatDecimal
}: AthletePageContentProps) {
  const [loading, setLoading] = useState(false);
  const age = calculateAge(athlete.birthdate);


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{athlete.firstName} {athlete.lastName}</h1>
          <div className="mt-2 text-gray-600">
            {age} Jahre | {athlete.gender}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch(`/api/export?id=${athlete.id}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `export-${athlete.lastName}.csv`;
                a.click();
              } catch (error) {
                console.error('Export failed:', error);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            disabled={loading}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Export CSV
          </button>
          <span className={`px-4 py-2 rounded-full ${
            athlete.proof 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {athlete.proof ? 'Nachweis vorhanden' : 'Nachweis fehlt'}
          </span>
        </div>
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
                      {perf.medal || '-'}
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

      <PerformanceChart
        performances={athlete.performances.map(p => ({
          ...p,
          value: p.value.toNumber(),
          date: p.date.toISOString()
        }))}
        discipline={Discipline.AUSDAUER}
        className="mb-8"
      />

      {ageWarnings.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8">
          <h3 className="font-bold mb-2">Alterswarnungen:</h3>
          <ul className="list-disc pl-5">
            {ageWarnings.map(warning => (
              <li key={warning.discipline}>
                {warning.discipline}: Nur für {warning.minAge}-{warning.maxAge} Jahre
              </li>
            ))}
          </ul>
        </div>
      )}

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
        href={`/athletes/${athlete.id}/log-performance`}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Neue Leistung erfassen
      </a>
    </div>
  );
}
