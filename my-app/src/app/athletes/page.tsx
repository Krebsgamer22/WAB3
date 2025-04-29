'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import AthleteTable from '../components/AthleteTable';
import AthleteForm from '../components/AthleteForm';

export default function AthletesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: athletes, isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      const res = await fetch('/api/athletes');
      return res.json();
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Athlete Directory</h1>
        <button
          onClick={() => {
            console.log('Opening athlete modal');
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors z-10 flex-shrink-0"
          data-testid="add-athlete-button"
        >
          Add New Athlete
        </button>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white rounded-xl p-6 relative">
            <div className="overflow-auto max-h-[80vh]">
              <Dialog.Title className="text-lg font-bold mb-4">
                Add New Athlete
              </Dialog.Title>
              <AthleteForm onSuccess={() => setIsModalOpen(false)} />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {isLoading ? (
        <p>Loading athletes...</p>
      ) : (
        <AthleteTable athletes={athletes} />
      )}
    </div>
  );
}
