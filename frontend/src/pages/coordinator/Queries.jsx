import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Queries = () => {
  const { addToast } = useToast();
  const [queries, setQueries] = useState([]);
  const [responseText, setResponseText] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchQueries = async () => {
    try {
      const res = await api.get('/query/all');
      // Show OPEN queries first
      const sorted = res.data.sort((a, b) => (a.status === 'OPEN' ? -1 : 1));
      setQueries(sorted);
    } catch (error) {
      addToast("Failed to fetch queries", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleRespond = async (id) => {
    const text = responseText[id];
    if (!text) {
      addToast("Response cannot be empty", "error");
      return;
    }
    try {
      await api.put(`/query/respond/${id}`, { response: text });
      addToast("Response sent.", "success");
      fetchQueries();
    } catch (error) {
      addToast("Failed to send response", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Team Queries</h1>
      {queries.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded">
          No queries in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {queries.map(q => (
            <Card key={q.id} className={q.status === 'OPEN' ? 'border-l-4 border-l-yellow-500' : 'opacity-70'}>
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-500 text-xs font-mono">Team ID: {q.team_id}</p>
                <span className={`text-xs px-2 py-1 rounded font-bold ${q.status === 'OPEN' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  {q.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{q.question}</h3>
              
              {q.status === 'OPEN' ? (
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Type your official response..."
                    value={responseText[q.id] || ''}
                    onChange={e => setResponseText({...responseText, [q.id]: e.target.value})}
                  />
                  <Button onClick={() => handleRespond(q.id)}>Send Reply</Button>
                </div>
              ) : (
                <div className="bg-zinc-900 p-3 rounded text-sm text-zinc-300 border-l-2 border-green-600">
                  <span className="text-green-500 font-bold block text-xs mb-1">YOUR RESPONSE:</span>
                  {q.response}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Queries;