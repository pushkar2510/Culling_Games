import React from 'react';
import { Card } from '../../components/ui/Components';
import { CheckCircle } from 'lucide-react';

const Verified = () => {
  // Mock Data
  const history = [
    { id: 1, team: "NullPointers", task: "Setup", points: 20, status: "VERIFIED", date: "2026-02-17" },
    { id: 2, team: "SegFaults", task: "Task 1", points: 0, status: "REJECTED", date: "2026-02-16" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Verification History</h1>
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
            <tr>
              <th className="p-4">Team</th>
              <th className="p-4">Task</th>
              <th className="p-4">Date</th>
              <th className="p-4">Verdict</th>
              <th className="p-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {history.map(h => (
              <tr key={h.id} className="text-zinc-300 hover:bg-zinc-900/50">
                <td className="p-4 font-bold">{h.team}</td>
                <td className="p-4">{h.task}</td>
                <td className="p-4 text-zinc-500">{h.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    h.status === 'VERIFIED' ? 'bg-blue-900/30 text-blue-500' : 'bg-red-900/30 text-red-500'
                  }`}>
                    {h.status}
                  </span>
                </td>
                <td className="p-4 text-right">{h.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Verified;