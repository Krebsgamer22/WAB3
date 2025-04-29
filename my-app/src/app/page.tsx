import Image from "next/image";
import AthleteForm from "./components/AthleteForm";

export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20">
      <AthleteForm />
    </div>
  );
}
