import Sidebar from "@/components/Layout/Sidebar";

export default function Resources() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Resources</h1>
          <p className="text-gray-600">Manage your cloud resources here.</p>
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Coming Soon</h2>
            <p className="text-gray-500">Resource management features will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}