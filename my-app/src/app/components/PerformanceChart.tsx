'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useRef } from 'react';

type Discipline = 'SWIMMING' | 'RUNNING' | 'CYCLING';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MEDAL_COLORS = {
  GOLD: '#FFD700',
  SILVER: '#C0C0C0',
  BRONZE: '#CD7F32',
};

interface Performance {
  id: number;
  value: number;
  date: string;
  discipline: string;
  medal: 'GOLD' | 'SILVER' | 'BRONZE' | null;
}

interface PerformanceChartProps {
  performances: Performance[];
  discipline: Discipline;
  className?: string;
}

export default function PerformanceChart({ performances, discipline, className }: PerformanceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const filteredData = performances.filter(p => p.discipline === discipline);
  
  const chartData = {
    labels: filteredData.map(p => new Date(p.date).toLocaleDateString()),
    datasets: [{
      label: 'Performance Value',
      data: filteredData.map(p => p.value),
      borderColor: MEDAL_COLORS.GOLD,
      backgroundColor: MEDAL_COLORS.GOLD + '33',
      tension: 0.4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const }
    },
    scales: {
      x: { grid: { display: false } },
      y: { title: { display: true, text: 'Value' } }
    }
  };

  return (
    <div className={`h-96 w-full p-4 bg-white rounded-lg shadow-md ${className}`}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
