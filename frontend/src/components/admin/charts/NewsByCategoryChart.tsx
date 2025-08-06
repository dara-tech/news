'use client';

import React, { useState, useMemo, useCallback, JSX } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { Newspaper, Zap } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Card } from '@/components/ui/card';

// --- TYPE DEFINITIONS ---
interface ChartData {
  name: string;
  count: number;
}

interface NewsByCategoryChartProps {
  data: ChartData[];
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: { payload: ChartData }[];
  label?: string;
}

// --- STYLING & THEME ---
const COLORS = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  grid: '#e5e7eb',
  text: '#6b7280',
  tooltipBg: '#ffffff',
};

// --- CUSTOM COMPONENTS ---
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-indigo-600">{`Articles: ${data.count}`}</p>
      </div>
    );
  }
  return null;
};

// --- MAIN CHART COMPONENT ---
export default function NewsByCategoryChart({ data = [] }: NewsByCategoryChartProps): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Safely calculate total articles with error handling
  const totalArticles: number = useMemo(() => {
    try {
      if (!Array.isArray(data)) {
        return 0;
      }
      return data.reduce((sum, item) => {
        const count = typeof item?.count === 'number' ? item.count : 0;
        return sum + count;
      }, 0);
    } catch {
      return 0;
    }
  }, [data]);

  // Safely find active data
  const activeData: ChartData | undefined = useMemo(() => {
    if (!Array.isArray(data)) return undefined;
    return data.find(d => d?.name === activeCategory);
  }, [data, activeCategory]);

  const handleBarClick = useCallback((payload: ChartData) => {
    if (payload && payload.name) {
      setActiveCategory(prev => (prev === payload.name ? null : payload.name));
    }
  }, []);

  return (
    <Card className="p-3 sm:p-4 lg:p-6 rounded-xl shadow-md font-sans">
      {/* Mobile-optimized Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-bold ">Category Insights</h3>
          <p className="text-xs sm:text-sm text-gray-500">Article volume by category</p>
        </div>
        {/* Mobile: Show total articles prominently */}
        <div className="flex items-center space-x-2 sm:hidden">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Articles</p>
            <p className="text-lg font-bold text-gray-800">{totalArticles.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Chart Section */}
      <div className="w-full h-[280px] sm:h-[350px]">
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 10, right: 5, left: -5, bottom: 5 }}
            onClick={(e: unknown) => {
              const clickData = e as { activePayload?: { payload: ChartData }[] };
              if (clickData.activePayload && clickData.activePayload.length > 0) {
                handleBarClick(clickData.activePayload[0].payload);
              }
            }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: COLORS.text, fontSize: 10 }} 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: COLORS.text, fontSize: 10 }} 
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="url(#colorUv)">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  className="transition-opacity"
                  style={{ cursor: 'pointer' }}
                  opacity={activeCategory === null || activeCategory === entry.name ? 1 : 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile-optimized Summary & Details Section */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
        {activeData ? (
          <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg transition-all duration-300">
            <h4 className="font-bold text-indigo-800 text-base sm:text-lg truncate">{activeData.name}</h4>
            <div className="flex items-center space-x-2 mt-2">
              <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
              <span className="text-gray-700 font-medium text-sm sm:text-base">{activeData.count.toLocaleString()} articles</span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center justify-between p-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Articles</p>
                <p className="text-xl font-bold text-gray-800">{totalArticles.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
