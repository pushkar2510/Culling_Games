import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const Tasks = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch BOTH active tasks and my submissions
        const [tasksRes, subsRes] = await Promise.all([
          api.get('/tasks/active'),
          api.get('/submissions/my')
        ]);
        
        // Extract IDs of tasks we've already submitted
        const submittedTaskIds = subsRes.data.map(sub => sub.task_id);
        
        // Filter out the submitted tasks so they vanish from the active list
        const availableTasks = tasksRes.data.filter(t => !submittedTaskIds.includes(t.task_id));
        
        setTasks(availableTasks);
      } catch (error) {
        addToast("Failed to fetch active directives", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <h1 className="text-3xl font-bold text-white">Mission Logs</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {tasks.map(task => {
          const isBonus = task.category === 'BONUS';
          return (
            <Card key={task.task_id} className={`border-l-4 ${isBonus ? 'border-l-yellow-500' : 'border-l-red-600'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      isBonus ? 'bg-yellow-900/30 text-yellow-500' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {task.category || 'STANDARD'}
                    </span>
                    <span className="text-zinc-500 text-xs font-mono">ID: {task.task_id}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{task.name}</h3>
                  
                  {isBonus && (
                    <p className="text-sm text-yellow-500 flex items-center gap-2 mb-2">
                      <Star size={14} /> Completing this allows power eligibility
                    </p>
                  )}
                  
                  <p className="text-zinc-500 text-sm">
                    Protocol: Execute solution and upload evidence.
                  </p>
                </div>

                <div className="flex flex-col items-end justify-center gap-3 min-w-[120px]">
                  <div className="text-2xl font-bold text-white">
                    {task.points} <span className="text-xs text-zinc-500">PTS</span>
                  </div>
                  <Link to="/team/submit" state={{ taskId: task.task_id }}>
                    <Button variant={isBonus ? "secondary" : "primary"} className="w-full">
                      Initialize
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="text-center p-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
            No active directives available. You have completed everything!
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;