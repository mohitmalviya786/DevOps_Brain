import Sidebar from "@/components/Layout/Sidebar";

export default function Costs() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Cost Optimization</h1>
          <p className="text-gray-600">Analyze and optimize your cloud spending.</p>
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Coming Soon</h2>
            <p className="text-gray-500">Cost optimization features will be available soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}