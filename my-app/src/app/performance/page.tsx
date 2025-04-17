import PerformanceChart from "@/app/components/PerformanceChart";
import YearSelector from "@/app/components/YearSelector";

export default function PerformancePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Performance Statistics</h1>
      <YearSelector />
      <PerformanceChart performances={[]} discipline="SWIMMING" />
    </div>
  );
}
