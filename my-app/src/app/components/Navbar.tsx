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
      <Link
        href="/performance"
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Performance Stats
      </Link>
      <Link
        href="/certificates"
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Certificates
      </Link>
      <Link
        href="/settings"
        className="text-gray-600 hover:text-blue-600 transition-colors"
      >
        Settings
      </Link>
    </div>
  );
}
