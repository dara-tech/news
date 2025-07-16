'use client';

import React, { useState, useMemo, useCallback, JSX } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { Newspaper, Zap } from 'lucide-react';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

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
export default function NewsByCategoryChart({ data }: NewsByCategoryChartProps): JSX.Element {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalArticles: number = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);
  const activeData: ChartData | undefined = useMemo(() => data.find(d => d.name === activeCategory), [data, activeCategory]);

  const handleBarClick = useCallback((payload: ChartData) => {
    if (payload && payload.name) {
      setActiveCategory(prev => (prev === payload.name ? null : payload.name));
    }
  }, []);

  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200/80 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Category Insights</h3>
          <p className="text-sm text-gray-500">Article volume by category</p>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
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
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: COLORS.text, fontSize: 12 }} width={40} />
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

      {/* Summary & Details Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        {activeData ? (
          <div className="p-4 bg-indigo-50 rounded-lg transition-all duration-300">
            <h4 className="font-bold text-indigo-800 text-lg">{activeData.name}</h4>
            <div className="flex items-center space-x-2 mt-2">
              <Newspaper className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-700 font-medium">{activeData.count.toLocaleString()} articles</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2">
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
    </div>
  );
}
