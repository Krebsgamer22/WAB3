'use client';

import YearSelector from './YearSelector';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Athlete Performance Tracker</h1>
        <YearSelector />
      </header>
      {children}
    </>
  );
}
