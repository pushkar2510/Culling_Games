// import React, { useState, useEffect } from 'react';
// import { Card, Button, Loader } from '../../components/ui/Components';
// import { ExternalLink, Check, X, Clock } from 'lucide-react';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const Pending = () => {
//   const { addToast } = useToast();
//   const [submissions, setSubmissions] = useState([]);
//   const [points, setPoints] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPending = async () => {
//       try {
//         const res = await api.get('/admin/coordinator-pending-submissions');
//         setSubmissions(res.data);
//       } catch (error) {
//         addToast("Failed to load pending submissions", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPending();
//   }, [addToast]);

//   const handleVerify = async (id) => {
//     const pts = points[id] || 0; 
//     try {
//       await api.put(`/submissions/verify/${id}`, { 
//         action: "VERIFIED", 
//         points: Number(pts) 
//       });
//       addToast(`Submission Verified. Sent to Master for final approval.`, "success");
//       setSubmissions(prev => prev.filter(s => s.submission_id !== id));
//     } catch (error) {
//       addToast(error.response?.data?.error || "Failed to verify submission", "error");
//     }
//   };

//   const handleReject = async (id) => {
//     if(!window.confirm("Are you sure you want to reject this submission?")) return;
//     try {
//       await api.put(`/submissions/verify/${id}`, { action: "REJECTED" });
//       addToast(`Submission Rejected.`, "error");
//       setSubmissions(prev => prev.filter(s => s.submission_id !== id));
//     } catch (error) {
//       addToast(error.response?.data?.error || "Failed to reject submission", "error");
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="text-3xl font-bold text-white mb-6">Pending Reviews</h1>

//       {submissions.length === 0 ? (
//         <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
//           All caught up! No pending submissions.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6">
//           {submissions.map(sub => (
//             <Card key={sub.submission_id} className="border-l-4 border-l-yellow-500">
//               <div className="flex flex-col gap-4">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <span className="text-yellow-500 text-xs font-bold flex items-center gap-1 mb-1">
//                       <Clock size={12} /> PENDING REVIEW
//                     </span>
//                     <h3 className="text-xl font-bold text-white">{sub.task_name}</h3>
//                     <p className="text-blue-400 text-sm font-medium">Team: {sub.team_name}</p>
//                   </div>
//                   <span className="text-zinc-600 text-xs">{new Date(sub.created_at).toLocaleString()}</span>
//                 </div>

//                 <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
//                   <p className="text-zinc-300 text-sm mb-3">
//                     <span className="font-bold text-zinc-500 block mb-1">TEAM NOTES:</span>
//                     {sub.description || "No notes provided."}
//                   </p>
//                   <a 
//                     href={sub.proof_url} 
//                     target="_blank" 
//                     rel="noreferrer"
//                     className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-2 mt-4"
//                   >
//                     <ExternalLink size={14} /> Open Proof Document
//                   </a>
//                 </div>

//                 <div className="flex items-end gap-4 border-t border-zinc-800 pt-4 mt-2">
//                   <div className="flex-1">
//                     <label className="text-zinc-500 text-xs font-bold mb-1 block">ASSIGN POINTS</label>
//                     <input 
//                       type="number" 
//                       className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white w-full max-w-[150px] focus:border-blue-500 focus:outline-none"
//                       placeholder="e.g. 50"
//                       value={points[sub.submission_id] || ''}
//                       onChange={(e) => setPoints({...points, [sub.submission_id]: e.target.value})}
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Button variant="danger" onClick={() => handleReject(sub.submission_id)}>
//                       <X size={18} /> Reject
//                     </Button>
//                     <Button 
//                       className="bg-green-600 hover:bg-green-700 border-none"
//                       onClick={() => handleVerify(sub.submission_id)}
//                     >
//                       <Check size={18} /> Verify
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Pending;


import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { ExternalLink, Check, X, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Pending = () => {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [points, setPoints] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/admin/coordinator-pending-submissions');
        setSubmissions(res.data);
      } catch (error) {
        addToast("Failed to load pending submissions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [addToast]);

  const handleVerify = async (id) => {
    const pts = points[id] || 0; 
    try {
      await api.put(`/submissions/verify/${id}`, { 
        action: "VERIFIED", 
        points: Number(pts) 
      });
      addToast(`Submission Verified. Sent to Master for final approval.`, "success");
      setSubmissions(prev => prev.filter(s => s.submission_id !== id));
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to verify submission", "error");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject this submission?")) return;
    try {
      await api.put(`/submissions/verify/${id}`, { action: "REJECTED" });
      addToast(`Submission Rejected.`, "error");
      setSubmissions(prev => prev.filter(s => s.submission_id !== id));
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to reject submission", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Pending Reviews</h1>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
          All caught up! No pending submissions.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map(sub => (
            <Card key={sub.submission_id} className="border-l-4 border-l-yellow-500">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-yellow-500 text-xs font-bold flex items-center gap-1 mb-1">
                      <Clock size={12} /> PENDING REVIEW
                    </span>
                    <h3 className="text-xl font-bold text-white">{sub.task_name}</h3>
                    <p className="text-blue-400 text-sm font-medium">Team: {sub.team_name}</p>
                  </div>
                  <span className="text-zinc-600 text-xs">{new Date(sub.created_at).toLocaleString()}</span>
                </div>

                <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
                  <p className="text-zinc-300 text-sm mb-3 whitespace-pre-wrap">
                    <span className="font-bold text-zinc-500 block mb-1">TEAM NOTES & LINKS:</span>
                    {sub.description || "No notes provided."}
                  </p>
                  
                  {/* ONLY SHOW BUTTON IF PROOF URL EXISTS */}
                  {sub.proof_url && sub.proof_url.trim() !== "" && (
                    <a 
                      href={sub.proof_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-400 text-sm flex items-center gap-2 mt-4"
                    >
                      <ExternalLink size={14} /> Open Official Proof Document
                    </a>
                  )}
                </div>

                <div className="flex items-end gap-4 border-t border-zinc-800 pt-4 mt-2">
                  <div className="flex-1">
                    <label className="text-zinc-500 text-xs font-bold mb-1 block">ASSIGN POINTS</label>
                    <input 
                      type="number" 
                      className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white w-full max-w-[150px] focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. 50"
                      value={points[sub.submission_id] || ''}
                      onChange={(e) => setPoints({...points, [sub.submission_id]: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={() => handleReject(sub.submission_id)}>
                      <X size={18} /> Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 border-none"
                      onClick={() => handleVerify(sub.submission_id)}
                    >
                      <Check size={18} /> Verify
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pending;