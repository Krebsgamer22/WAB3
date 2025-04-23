"use client";
import { useState, useEffect } from 'react';
import PerformanceChart from "@/app/components/PerformanceChart";
import YearSelector from "@/app/components/YearSelector";
import AthleteSelect from "@/app/components/AthleteSelect";
import { Athlete, Discipline } from '@prisma/client';
import type { AthleteSelectProps } from "@/app/components/AthleteSelect";

export default function PerformancePage() {
  const [athleteId, setAthleteId] = useState<string>('');
  const [discipline, setDiscipline] = useState<Discipline>();
  const [year, setYear] = useState<string>('');
  const [performances, setPerformances] = useState<Array<any>>([]);
  const [athletes, setAthletes] = useState<Array<Athlete>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch athletes for selector
    fetch('/api/athletes')
      .then(res => res.json())
      .then(data => setAthletes(data));
  }, []);

  useEffect(() => {
    // Fetch performances when filters change
    if (year) { // Require year selection
      setLoading(true);
      const params = new URLSearchParams({
        athleteId,
        discipline: discipline || '',
        year
      }).toString();

      fetch(`/api/performance?${params}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setPerformances(data);
          setLoading(false);
        });
    }
  }, [athleteId, discipline, year]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Performance Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AthleteSelect
          athletes={athletes}
          value={athleteId}
          onChange={setAthleteId}
        />
        
        <select
          value={discipline || ''}
          onChange={(e) => setDiscipline(e.target.value as Discipline)}
          className="p-2 border rounded"
        >
          <option value="">All Disciplines</option>
          {Object.values(Discipline).map(d => (
            <option key={d} value={d}>{d.toLowerCase()}</option>
          ))}
        </select>

        <YearSelector 
          value={year}
          onChange={setYear}
        />
      </div>

      {loading ? (
        <div className="text-center">Loading performances...</div>
      ) : performances.length > 0 ? (
        <PerformanceChart 
          performances={performances}
          discipline={discipline || Object.values(Discipline)[0]}
        />
      ) : year ? (
        <div className="text-center">No performances found for selected filters</div>
      ) : (
        <div className="text-center">Please select a year to view performances</div>
      )}
    </div>
  );
}
