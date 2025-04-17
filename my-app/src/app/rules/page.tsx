import { Rule } from '@prisma/client';

async function getRules(): Promise<Rule[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
}

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Competition Rules</h1>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 bg-white rounded-lg shadow">
            <h2 className="font-semibold text-lg">{rule.discipline}</h2>
            <p className="text-gray-600 mt-2">{rule.description}</p>
            <div className="mt-2 text-sm text-gray-500">
              Effective Year: {rule.effectiveYear}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
