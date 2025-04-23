'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YearSelector from './YearSelector';

const queryClient = new QueryClient();

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      
      {children}
    </QueryClientProvider>
  );
}
