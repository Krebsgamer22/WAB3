"use client";

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AthleteForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthdate: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', firstName: '', lastName: '' };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results: Papa.ParseResult<unknown>) => {
        if (results.errors.length) {
          toast.error('Error parsing CSV file');
          return;
        }
        setCsvData(results.data.slice(1)); // Skip header row
      },
      header: true,
    });
  };

  const validateCSVRow = (row: any) => {
    const errors = [];
    
    // Validate date format (TT.MM.JJJJ)
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(row.birthdate)) {
      errors.push('Invalid date format (use TT.MM.JJJJ)');
    }

    return errors.length ? errors.join(', ') : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (csvData.length > 0) {
        // Check for duplicates
        const uniqueCombos = new Set();
        const duplicates: string[] = [];
        
        const validRows = csvData.filter((row) => {
          const key = `${row.email}-${row.birthdate}`;
          if (uniqueCombos.has(key)) {
            duplicates.push(key);
            return false;
          }
          uniqueCombos.add(key);
          return !validateCSVRow(row);
        });

        if (duplicates.length) {
          toast.error(`Found ${duplicates.length} duplicate entries`);
          setDuplicates(duplicates);
          return;
        }

        const response = await fetch('/api/athletes/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validRows),
        });

        if (!response.ok) throw new Error('Bulk upload failed');
        toast.success(`Successfully added ${validRows.length} athletes`);
        setCsvData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        if (!validateForm()) return;
        
        // Upload swimming proof first if exists
        let fileUrl = '';
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const uploadResponse = await fetch('/api/upload-proof', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) throw new Error('File upload failed');
          const { url } = await uploadResponse.json();
          fileUrl = url;
        }

        // Submit athlete data with proof URL
        const response = await fetch('/api/athletes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            proofUrl: fileUrl
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Submission failed');
        }
        toast.success('Athlete added successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          birthdate: ''
        });
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ email: '', firstName: '', lastName: '' });
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Submission failed due to an unexpected error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6 bg-white p-8 rounded-2xl shadow-lg">
      <div className="border-b border-gray-200 pb-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Upload CSV File
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </label>
        <p className="mt-2 text-sm text-gray-500">
          CSV should contain columns: firstName, lastName, email, birthdate (TT.MM.JJJJ format)
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 transition-all hover:border-indigo-200"
            />
          </label>
          {errors.firstName && 
            <p className="mt-2 flex items-center text-red-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.firstName}
            </p>
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 transition-all hover:border-indigo-200"
            />
          </label>
          {errors.lastName && 
            <p className="mt-2 flex items-center text-red-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.lastName}
            </p>
          }
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 transition-all hover:border-indigo-200"
            />
          </label>
          {errors.email && 
            <p className="mt-2 flex items-center text-red-600 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          }
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Birthdate
            <input
              type="date"
              value={formData.birthdate}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 text-sm px-4 py-3 transition-all hover:border-indigo-200"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </div>
        ) : (
          'Submit Athlete'
        )}
      </button>
    </form>
  );
}
