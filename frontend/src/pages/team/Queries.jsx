import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Queries = () => {
  const { addToast } = useToast();
  const [question, setQuestion] = useState("");
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueries = async () => {
    try {
      const res = await api.get('/query/my');
      // Sort to show newest first
      const sortedQueries = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setQueries(sortedQueries);
    } catch (error) {
      addToast("Failed to fetch comms log", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/query/create', { question });
      addToast("Query submitted to coordinators.", "success");
      setQuestion("");
      fetchQueries(); // Refresh the list
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to submit query", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white">Comms Link</h1>

      {/* Create Query */}
      <Card>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <input 
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-white focus:border-red-600 focus:outline-none"
              placeholder="Ask for clarification or report an issue..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !question.trim()}>
            <Send size={18} />
          </Button>
        </form>
      </Card>

      {/* History */}
      <div className="space-y-4">
        {queries.length === 0 && (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded">
            No queries submitted yet.
          </div>
        )}
        {queries.map(q => (
          <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-white text-lg">{q.question}</h4>
              <span className={`text-xs px-2 py-1 rounded font-bold ${
                q.status === 'ANSWERED' ? 'bg-green-900/30 text-green-500' : 'bg-zinc-800 text-zinc-500'
              }`}>
                {q.status}
              </span>
            </div>
            {q.response ? (
              <div className="bg-zinc-950 p-3 rounded border-l-2 border-green-600 text-zinc-300 text-sm">
                <span className="text-green-500 font-bold block text-xs mb-1">COORDINATOR RESPONSE:</span>
                {q.response}
              </div>
            ) : (
              <p className="text-zinc-600 text-sm italic">Awaiting response...</p>
            )}
            <p className="text-zinc-700 text-xs mt-3 text-right">
              {new Date(q.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Queries;