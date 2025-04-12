"use client";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

type Athlete = {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
};

const AthleteTable = () => {
  const [sortKey, setSortKey] = useState<'firstName' | 'lastName' | 'birthdate'>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data: athletes = [], isLoading } = useQuery<Athlete[]>({
    queryKey: ['athletes', sortKey, sortDirection],
    queryFn: async () => {
      const res = await fetch(`/api/athletes?sortBy=${sortKey}&order=${sortDirection}`);
      return res.json();
    }
  });

  const handleHeaderClick = (key: 'firstName' | 'lastName' | 'birthdate') => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedAthletes = [...athletes].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortKey === 'birthdate') {
      return modifier * (new Date(a.birthdate).getTime() - new Date(b.birthdate).getTime());
    }
    return modifier * a[sortKey].localeCompare(b[sortKey]);
  });

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading athletes...</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['First Name', 'Last Name', 'Birthdate', 'Gender'].map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleHeaderClick(
                  header === 'First Name' ? 'firstName' :
                  header === 'Last Name' ? 'lastName' : 'birthdate'
                )}
              >
                {header}
                {sortKey === (header === 'First Name' ? 'firstName' :
                  header === 'Last Name' ? 'lastName' : 'birthdate') && (
                  <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAthletes.map((athlete) => (
            <tr key={athlete.id}>
              <td className="px-6 py-4 whitespace-nowrap">{athlete.firstName}</td>
              <td className="px-6 py-4 whitespace-nowrap">{athlete.lastName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(athlete.birthdate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{athlete.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AthleteTable;
