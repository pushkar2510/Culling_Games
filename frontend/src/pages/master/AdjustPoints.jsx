// import React, { useState } from 'react';
// import { Card, Input, Button } from '../../components/ui/Components';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const AdjustPoints = () => {
//   const { addToast } = useToast();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [form, setForm] = useState({ 
//     team_id: '', 
//     points: 0, 
//     reason: '', 
//     proof_url: '' 
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         team_id: Number(form.team_id),
//         points: Number(form.points),
//         reason: form.reason,
//         proof_url: form.proof_url || null
//       };

//       const res = await api.post('/admin/adjust-points', payload);
      
//       addToast(`Points adjusted successfully. New Total: ${res.data.team_total_points}`, "success");
//       setForm({ team_id: '', points: 0, reason: '', proof_url: '' }); // reset form
//     } catch (error) {
//       addToast(error.response?.data?.error || "Failed to adjust points", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto animate-fade-in">
//       <h1 className="text-3xl font-bold text-white mb-6">Manual Point Adjustment</h1>
//       <Card>
//         <p className="text-zinc-400 text-sm mb-6 pb-4 border-b border-zinc-800">
//           Use this panel to manually override team scores. Positive numbers add points (subject to weekly caps), negative numbers deduct points.
//         </p>
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <Input 
//                 label="Target Team ID" 
//                 type="number"
//                 value={form.team_id}
//                 onChange={e => setForm({...form, team_id: e.target.value})}
//                 required 
//             />
//             <Input 
//                 label="Points to Add/Deduct (e.g., 50 or -50)" 
//                 type="number"
//                 value={form.points}
//                 onChange={e => setForm({...form, points: e.target.value})}
//                 required 
//             />
//             <Input 
//                 label="Reason for Adjustment" 
//                 value={form.reason}
//                 onChange={e => setForm({...form, reason: e.target.value})}
//                 placeholder="e.g., Penalty for rule violation"
//                 required 
//             />
//             <Input 
//                 label="Proof URL (Optional)" 
//                 value={form.proof_url}
//                 onChange={e => setForm({...form, proof_url: e.target.value})}
//                 placeholder="Link to screenshot or log"
//             />
//             <Button type="submit" variant="danger" className="w-full mt-4" disabled={isSubmitting}>
//               {isSubmitting ? 'Executing...' : 'Execute Adjustment'}
//             </Button>
//         </form>
//       </Card>
//     </div>
//   );
// };

// export default AdjustPoints;


import React, { useState } from 'react';
import { Card, Input, Button } from '../../components/ui/Components';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const AdjustPoints = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    team_id: '', 
    points: 0, 
    reason: '', 
    proof_url: '' 
  });

  const isSuperAdmin = user?.email === 'uzumakiaditya433@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 bg-red-900/20 border border-red-600 text-red-500 rounded text-center">
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold">ACCESS DENIED</h2>
        <p className="mt-2 text-zinc-400">Manual point adjustment is restricted to the Super Administrator.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        team_id: Number(form.team_id),
        points: Number(form.points),
        reason: form.reason,
        proof_url: form.proof_url || null
      };

      const res = await api.post('/admin/adjust-points', payload);
      
      addToast(`Points adjusted successfully. New Total: ${res.data.team_total_points}`, "success");
      setForm({ team_id: '', points: 0, reason: '', proof_url: '' }); 
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to adjust points", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Manual Point Adjustment</h1>
      <Card>
        <p className="text-zinc-400 text-sm mb-6 pb-4 border-b border-zinc-800">
          Use this panel to manually override team scores. Positive numbers add points (subject to weekly caps), negative numbers deduct points.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="Target Team ID" 
                type="number"
                value={form.team_id}
                onChange={e => setForm({...form, team_id: e.target.value})}
                required 
            />
            <Input 
                label="Points to Add/Deduct (e.g., 50 or -50)" 
                type="number"
                value={form.points}
                onChange={e => setForm({...form, points: e.target.value})}
                required 
            />
            <Input 
                label="Reason for Adjustment" 
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
                placeholder="e.g., Penalty for rule violation"
                required 
            />
            <Input 
                label="Proof URL (Optional)" 
                value={form.proof_url}
                onChange={e => setForm({...form, proof_url: e.target.value})}
                placeholder="Link to screenshot or log"
            />
            <Button type="submit" variant="danger" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Executing...' : 'Execute Adjustment'}
            </Button>
        </form>
      </Card>
    </div>
  );
};

export default AdjustPoints;