'use client';

import { useQuery } from '@tanstack/react-query';
import AthleteTable from '../components/AthleteTable';

export default function AthletesPage() {
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const res = await fetch('/api/athletes');
      return res.json();
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Athlete Directory</h1>
      {isLoading ? (
        <p>Loading athletes...</p>
      ) : (
        <AthleteTable athletes={athletes} />
      )}
    </div>
  );
}
