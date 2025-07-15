import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
