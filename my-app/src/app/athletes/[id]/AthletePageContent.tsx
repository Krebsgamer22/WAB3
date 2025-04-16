"use client";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Prisma, Discipline, MedalType } from '@prisma/client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CertificateTemplate from '@/app/components/CertificateTemplate';
import Link from 'next/link';
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
  const [showDialog, setShowDialog] = useState(false);
  const [rulesUrl, setRulesUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { data: athleteData, isLoading } = useQuery({
    queryKey: ['athlete', athlete.id],
    queryFn: () => fetch(`/api/athletes?id=${athlete.id}`).then(res => res.json()),
    staleTime: 300000 // 5 minutes cache
  });
  const age = calculateAge(athlete.birthdate);

  const handleRulesUpdate = async () => {
    const [isUpdating, setIsUpdating] = useState(false);
    try {
      // Security validation
      if (!rulesUrl.startsWith('https://')) {
        alert('Nur HTTPS-URLs sind erlaubt');
        return;
      }

      const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
      const urlObj = new URL(rulesUrl);
      
      if (!allowedDomains.includes(urlObj.hostname)) {
        alert('Ungültige Domain');
        return;
      }

      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: rulesUrl }),
      });

      if (!response.ok) throw new Error('Fehler beim Aktualisieren');
      
      alert('Regelungen erfolgreich aktualisiert');
      setShowDialog(false);
    } catch (error) {
      console.error('Update failed:', error);
      alert('Aktualisierung fehlgeschlagen');
    } finally {
      setIsUpdating(false);
    }
  };

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
            className={`px-4 py-2 rounded-md ${
              (new Date().getMonth() === 0 && new Date().getDate() <= 28) 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            } text-white`}
            onClick={() => setShowDialog(true)}
          >
            Regelungen aktualisieren
          </button>
          <button 
              onClick={async () => {
              setIsExporting(true);
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
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            disabled={isLoading}
          >
            {isExporting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            Export CSV
          </button>
          <PDFDownloadLink
            document={<CertificateTemplate athlete={athlete} />}
            fileName={`certificate-${athlete.lastName}.pdf`}
          >
            {({ loading }: { loading: boolean }) => (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300 flex items-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Download Certificate
              </button>
            )}
          </PDFDownloadLink>
          <span className={`px-4 py-2 rounded-full ${
            athlete.proof 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {athlete.proof ? 'Nachweis vorhanden' : 'Nachweis fehlt'}
          </span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Swimming Proof Template</h2>
        <Link
          href="/swimming-proof-templates/official-template.pdf"
          download
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
        >
          Download Official Template
        </Link>
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

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Regelungen aktualisieren</h2>
            <input
              type="text"
              value={rulesUrl}
              onChange={(e) => setRulesUrl(e.target.value)}
              placeholder="Regelungen URL eingeben"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRulesUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
