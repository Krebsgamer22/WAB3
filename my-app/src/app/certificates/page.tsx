import CertificateTemplate from "@/app/components/CertificateTemplate";

export default function CertificatesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Certificate Management</h1>
      <CertificateTemplate athlete={{
        id: 1,
        firstName: "John",
        lastName: "Doe",
        birthdate: new Date("2000-01-01"),
        gender: "MALE",
        discipline: "SWIMMING",
        email: "john@example.com"
      }} />
    </div>
  );
}
