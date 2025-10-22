
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsEntry } from '../types';
import { ArrowUturnLeftIcon, XMarkIcon } from './icons';

interface DashboardProps {
  analyticsData: AnalyticsEntry[];
  onViewChange: () => void;
}

const COLORS = {
  text: '#38bdf8', // lightBlue-400
  voice: '#34d399', // emerald-400
  file: '#fbbf24', // amber-400
};

const Dashboard: React.FC<DashboardProps> = ({ analyticsData, onViewChange }) => {
  const interactionCounts = analyticsData.reduce((acc, entry) => {
    acc[entry.type] = (acc[entry.type] || 0) + 1;
    return acc;
  }, {} as Record<'text' | 'voice' | 'file', number>);

  const chartData = Object.entries(interactionCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
     <div className="w-full max-w-5xl h-[90vh] max-h-[800px] bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-600/50">
      {/* Window Header */}
      <header className="flex items-center justify-between p-3 bg-slate-900/70 border-b border-slate-700/50 select-none">
        <h1 className="text-xl font-bold text-slate-200">Analytics Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={onViewChange} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors" title="Back to Chat">
            <ArrowUturnLeftIcon className="w-5 h-5 text-slate-400" />
          </button>
           <button className="p-2 rounded-full hover:bg-red-500/50 transition-colors" title="Close">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto p-6 text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="md:col-span-1 bg-slate-900/50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Interaction Types</h2>
             {analyticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-[250px] text-slate-500">
                    No interaction data yet.
                </div>
            )}
          </div>
          
          {/* Log Table */}
          <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-slate-100">Interaction Log</h2>
            <div className="overflow-auto max-h-[60vh]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/70 sticky top-0">
                  <tr>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Command</th>
                    <th className="p-2">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {analyticsData.slice().reverse().map((entry, index) => (
                    <tr key={index} className="hover:bg-slate-800/50">
                      <td className="p-2 whitespace-nowrap">{entry.timestamp.toLocaleTimeString()}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{backgroundColor: `${COLORS[entry.type]}30`, color: COLORS[entry.type]}}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-2 max-w-xs truncate">{entry.command}</td>
                      <td className="p-2 max-w-xs truncate">{entry.response}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
               {analyticsData.length === 0 && (
                 <div className="text-center p-8 text-slate-500">No logs to display.</div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
