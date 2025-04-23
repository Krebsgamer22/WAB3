"use client";
import { Athlete } from '@prisma/client';

export interface AthleteSelectProps {
  athletes: Athlete[];
  value: string;
  onChange: (value: string) => void;
}

export default function AthleteSelect({ athletes, value, onChange }: AthleteSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded"
    >
      <option value="">All Athletes</option>
      {athletes.map(athlete => (
        <option key={athlete.id} value={athlete.id}>
          {athlete.firstName} {athlete.lastName}
        </option>
      ))}
    </select>
  );
}
