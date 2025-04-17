export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Application Settings</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Notification Preferences</h2>
          {/* Settings form elements would go here */}
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
          {/* Settings form elements would go here */}
        </div>
      </div>
    </div>
  );
}
