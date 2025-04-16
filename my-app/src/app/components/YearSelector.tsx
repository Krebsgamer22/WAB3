'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function YearSelector() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedYear = localStorage.getItem('selectedYear');
      return savedYear ? parseInt(savedYear) : currentYear;
    }
    return currentYear;
  });

  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear.toString());
    queryClient.invalidateQueries();
  }, [selectedYear, queryClient]);

  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

  return (
    <div className="year-selector">
      <select 
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className="p-2 border rounded"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
