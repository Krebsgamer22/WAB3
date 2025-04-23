"use client";

import { useState } from 'react';

const performanceData = [
  // Ausdauer - 800 m Lauf
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '6-7', bronze: '5:40', silber: '5:00', gold: '4:15' },
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '8-9', bronze: '5:35', silber: '4:50', gold: '4:10' },
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '10-11', bronze: '5:20', silber: '4:40', gold: '4:00' },
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '12-13', bronze: '5:10', silber: '4:25', gold: '3:45' },
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '14-15', bronze: '5:00', silber: '4:20', gold: '3:35' },
  { kategorie: 'Ausdauer', disziplin: '800 m Lauf (Min.)', alter: '16-17', bronze: '4:50', silber: '4:05', gold: '3:25' },

  // Ausdauer - Dauer-/Geländelauf
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '6-7', bronze: '8:00', silber: '12:00', gold: '17:00' },
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '8-9', bronze: '10:00', silber: '15:00', gold: '20:00' },
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '10-11', bronze: '15:00', silber: '20:00', gold: '30:00' },
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '12-13', bronze: '20:00', silber: '30:00', gold: '40:00' },
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '14-15', bronze: '30:00', silber: '40:00', gold: '50:00' },
  { kategorie: 'Ausdauer', disziplin: 'Dauer-/Geländelauf (Min.)', alter: '16-17', bronze: '45:00', silber: '60:00', gold: '75:00' },

  // Ausdauer - Schwimmen
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '6-7', bronze: '200 m – 9:00', silber: '400 m – 7:40', gold: '400 m – 6:20' },
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '8-9', bronze: '200 m – 8:00', silber: '400 m – 7:00', gold: '400 m – 5:55' },
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '10-11', bronze: '200 m – 7:20', silber: '400 m – 6:25', gold: '400 m – 5:30' },
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '12-13', bronze: '200 m – 14:50', silber: '400 m – 12:55', gold: '400 m – 11:00' },
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '14-15', bronze: '200 m – 13:05', silber: '400 m – 11:40', gold: '400 m – 10:00' },
  { kategorie: 'Ausdauer', disziplin: 'Schwimmen (Zeit)', alter: '16-17', bronze: '200 m – 11:50', silber: '400 m – 10:30', gold: '400 m – 9:05' },

  // Ausdauer - Radfahren
  { kategorie: 'Ausdauer', disziplin: 'Radfahren (Zeit)', alter: '6-7', bronze: '5 km – 27:00', silber: '10 km – 24:00', gold: '10 km – 21:00' },
  { kategorie: 'Ausdauer', disziplin: 'Radfahren (Zeit)', alter: '8-9', bronze: '5 km – 50:30', silber: '10 km – 43:00', gold: '10 km – 35:30' },
  { kategorie: 'Ausdauer', disziplin: 'Radfahren (Zeit)', alter: '10-11', bronze: '5 km – 45:00', silber: '10 km – 39:30', gold: '10 km – 33:30' },
  { kategorie: 'Ausdauer', disziplin: 'Radfahren (Zeit)', alter: '12-13', bronze: '5 km – 38:00', silber: '10 km – 32:30', gold: '10 km – 28:30' },
  { kategorie: 'Ausdauer', disziplin: 'Radfahren (Zeit)', alter: '14-15', bronze: '5 km – 32:30', silber: '10 km – 28:30', gold: '10 km – 25:00' },

  // Kraft - Werfen
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '6-7', bronze: '6,00 m', silber: '9,00 m', gold: '12,00 m' },
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '8-9', bronze: '9,00 m', silber: '12,00 m', gold: '15,00 m' },
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '10-11', bronze: '11,00 m', silber: '15,00 m', gold: '18,00 m' },
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '12-13', bronze: '15,00 m', silber: '18,00 m', gold: '22,00 m' },
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '14-15', bronze: '20,00 m', silber: '24,00 m', gold: '27,00 m' },
  { kategorie: 'Kraft', disziplin: 'Werfen (Schlagball 80 g)', alter: '16-17', bronze: '24,00 m', silber: '27,00 m', gold: '31,00 m' },

  // Kraft - Medizinball
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '6-7', bronze: '2,50 m', silber: '3,50 m', gold: '4,50 m' },
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '8-9', bronze: '3,00 m', silber: '4,00 m', gold: '5,00 m' },
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '10-11', bronze: '5,00 m', silber: '6,00 m', gold: '7,00 m' },
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '12-13', bronze: '4,75 m', silber: '5,25 m', gold: '5,75 m' },
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '14-15', bronze: '5,50 m', silber: '6,00 m', gold: '6,50 m' },
  { kategorie: 'Kraft', disziplin: 'Medizinball (1 kg)', alter: '16-17', bronze: '5,75 m', silber: '6,25 m', gold: '6,75 m' },

  // Kraft - Standweitsprung
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '6-7', bronze: '1,05 m', silber: '1,25 m', gold: '1,40 m' },
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '8-9', bronze: '1,15 m', silber: '1,30 m', gold: '1,50 m' },
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '10-11', bronze: '1,30 m', silber: '1,45 m', gold: '1,65 m' },
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '12-13', bronze: '1,40 m', silber: '1,60 m', gold: '1,80 m' },
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '14-15', bronze: '1,55 m', silber: '1,70 m', gold: '1,90 m' },
  { kategorie: 'Kraft', disziplin: 'Standweitsprung', alter: '16-17', bronze: '1,65 m', silber: '1,80 m', gold: '2,00 m' },

  // Schnelligkeit - 30 m Lauf
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '6-7', bronze: '8,0', silber: '7,1', gold: '6,3' },
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '8-9', bronze: '7,4', silber: '6,6', gold: '5,7' },
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '10-11', bronze: '11,0', silber: '10,1', gold: '9,1' },
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '12-13', bronze: '10,6', silber: '9,6', gold: '8,5' },
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '14-15', bronze: '18,6', silber: '17,0', gold: '15,5' },
  { kategorie: 'Schnelligkeit', disziplin: '30 m Lauf (Sek.)', alter: '16-17', bronze: '17,6', silber: '16,3', gold: '15,0' },

  // Schnelligkeit - 25 m Schwimmen
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '6-7', bronze: '46,5', silber: '38,5', gold: '30,5' },
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '8-9', bronze: '42,0', silber: '34,0', gold: '28,0' },
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '10-11', bronze: '39,0', silber: '31,5', gold: '25,5' },
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '12-13', bronze: '35,0', silber: '29,0', gold: '23,5' },
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '14-15', bronze: '33,0', silber: '27,5', gold: '21,5' },
  { kategorie: 'Schnelligkeit', disziplin: '25 m Schwimmen (Sek.)', alter: '16-17', bronze: '30,5', silber: '25,5', gold: '20,0' },

  // Koordination - Hochsprung
  { kategorie: 'Koordination', disziplin: 'Hochsprung', alter: '6-7', bronze: '0,80 m', silber: '0,90 m', gold: '1,00 m' },
  { kategorie: 'Koordination', disziplin: 'Hochsprung', alter: '8-9', bronze: '0,90 m', silber: '1,00 m', gold: '1,10 m' },
  { kategorie: 'Koordination', disziplin: 'Hochsprung', alter: '10-11', bronze: '0,95 m', silber: '1,05 m', gold: '1,15 m' },
  { kategorie: 'Koordination', disziplin: 'Hochsprung', alter: '12-13', bronze: '1,05 m', silber: '1,15 m', gold: '1,25 m' },

  // Koordination - Weitsprung (Zonen)
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '6-7', bronze: '18 Pkt.', silber: '21 Pkt.', gold: '24 Pkt.' },
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '8-9', bronze: '24 Pkt.', silber: '27 Pkt.', gold: '30 Pkt.' },
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '10-11', bronze: '2,30 m', silber: '2,60 m', gold: '2,90 m' },
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '12-13', bronze: '2,80 m', silber: '3,10 m', gold: '3,40 m' },
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '14-15', bronze: '3,20 m', silber: '3,50 m', gold: '3,80 m' },
  { kategorie: 'Koordination', disziplin: 'Weitsprung (Zonen)', alter: '16-17', bronze: '3,40 m', silber: '3,70 m', gold: '4,00 m' },
];

const categories = [...new Set(performanceData.map(item => item.kategorie))];
const ageGroups = [...new Set(performanceData.map(item => item.alter))];

export default function RulesPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAge, setSelectedAge] = useState('');

  const filteredData = performanceData.filter(item => {
    const matchesCategory = selectedCategory ? item.kategorie === selectedCategory : true;
    const matchesAge = selectedAge ? item.alter === selectedAge : true;
    return matchesCategory && matchesAge;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Leistungstabelle</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <select 
          className="p-2 border rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Alle Kategorien</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={selectedAge}
          onChange={(e) => setSelectedAge(e.target.value)}
        >
          <option value="">Alle Altersgruppen</option>
          {ageGroups.map(age => (
            <option key={age} value={age}>{age}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disziplin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bronze</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Silber</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{item.disziplin}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.alter}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.bronze}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.silber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.gold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}