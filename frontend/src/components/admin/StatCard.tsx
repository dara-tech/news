import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 sm:p-3 rounded-full flex-shrink-0">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-500 text-xs sm:text-sm font-medium uppercase tracking-wide truncate">{title}</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );
}
