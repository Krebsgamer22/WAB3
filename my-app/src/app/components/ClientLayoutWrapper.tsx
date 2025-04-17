'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YearSelector from './YearSelector';

const queryClient = new QueryClient();

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <header className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Athlete Performance Tracker</h1>
        <YearSelector />
      </header>
      {children}
    </QueryClientProvider>
  );
}
