"use client";
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

import type { Athlete } from '@prisma/client';

interface AthleteTableProps {
  athletes: Athlete[];
}

const AthleteTable = ({ athletes }: AthleteTableProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success'|'error', message: string }|null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvData = e.target?.result;
          const response = await fetch('/api/athletes', {
            method: 'POST',
            body: csvData,
            headers: {
              'Content-Type': 'text/csv'
            }
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'CSV upload failed');
          }

          setUploadStatus({ type: 'success', message: 'Athletes imported successfully!' });
          setTimeout(() => setUploadStatus(null), 3000);
          window.location.reload();
        } catch (error) {
          setUploadStatus({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to import CSV'
          });
          setTimeout(() => setUploadStatus(null), 5000);
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setUploadStatus({
        type: 'error', 
        message: 'Failed to read CSV file'
      });
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const handleBulkExport = async () => {
    setBulkLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-export-${new Date().toISOString()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setBulkLoading(false);
    }
  };
  const [sortKey, setSortKey] = useState<'firstName' | 'lastName' | 'birthdate'>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const storedYear = localStorage.getItem('selectedYear');
    if (storedYear) {
      setSelectedYear(parseInt(storedYear));
    }
  }, []);

  const { data: filteredAthletes = [], isLoading } = useQuery<Athlete[]>({
    queryKey: ['athletes', sortKey, sortDirection, selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/athletes?sortBy=${sortKey}&order=${sortDirection}&year=${selectedYear}`);
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

  const sortedAthletes = [...filteredAthletes].sort((a, b) => {
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
      {uploadStatus && (
        <div className={`mb-4 p-3 rounded-md ${
          uploadStatus.type === 'success' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {uploadStatus.message}
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <td colSpan={5} className="p-4 bg-gray-50">
              <div className="flex gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                  id="csvUpload"
                />
                <label
                  htmlFor="csvUpload"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md cursor-pointer"
                >
                  Import CSV
                </label>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
                  onClick={handleBulkExport}
                  disabled={selectedIds.length === 0 || bulkLoading}
                >
                  {bulkLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  Export Selected ({selectedIds.length})
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredAthletes.length && filteredAthletes.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(filteredAthletes.map(a => a.id.toString()));
                  } else {
                    setSelectedIds([]);
                  }
                }}
              />
            </th>
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
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(athlete.id.toString())}
                  onChange={() => toggleSelection(athlete.id.toString())}
                  className="h-4 w-4"
                />
              </td>
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
