import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex space-x-8">
      <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
        Home
      </Link>
      <Link 
        href="/athletes" 
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Athletes
      </Link>
      <Link
        href="/rules"
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Competition Rules
      </Link>
    </div>
  );
}
