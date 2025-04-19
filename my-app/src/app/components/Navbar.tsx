import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex space-x-8">
      <Link href="/" className="text-secondary hover:text-primary transition-colors">
        Home
      </Link>
      <Link 
        href="/athletes" 
        className="text-secondary hover:text-primary transition-colors"
      >
        Athletes
      </Link>
      <Link
        href="/rules"
        className="text-secondary hover:text-primary transition-colors"
      >
        Competition Rules
      </Link>
      <Link
        href="/performance"
        className="text-secondary hover:text-primary transition-colors"
      >
        Performance Stats
      </Link>
      <Link
        href="/settings"
        className="text-secondary hover:text-primary transition-colors"
      >
        Settings
      </Link>
    </div>
  );
}
