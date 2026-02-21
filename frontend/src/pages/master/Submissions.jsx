// import React, { useState, useEffect } from 'react';
// import { Card, Button, Loader } from '../../components/ui/Components';
// import { Check, ExternalLink } from 'lucide-react';
// import { useToast } from '../../context/ToastContext';
// import api from '../../utils/api';

// const Submissions = () => {
//   const { addToast } = useToast();
//   const [submissions, setSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchVerifiedSubmissions = async () => {
//     try {
//       const res = await api.get('/submissions/verified');
//       setSubmissions(res.data);
//     } catch (error) {
//       addToast("Failed to load verified submissions", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVerifiedSubmissions();
//   }, []);

//   const handleApprove = async (id) => {
//     try {
//       const res = await api.put(`/submissions/approve/${id}`);
//       addToast(`Submission APPROVED. ${res.data.points_awarded} points awarded.`, "success");
//       setSubmissions(prev => prev.filter(s => s.id !== id));
//     } catch (error) {
//       addToast(error.response?.data?.error || "Failed to approve submission", "error");
//     }
//   };

//   if (loading) return <Loader />;

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="text-3xl font-bold text-white mb-6">Final Approvals</h1>

//       {submissions.length === 0 ? (
//         <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
//           No pending approvals from coordinators.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {submissions.map(sub => (
//             <Card key={sub.id} className="border-l-4 border-l-blue-500">
//               <div className="flex flex-col md:flex-row justify-between items-start gap-4">
//                 <div className="flex-1">
//                   <h3 className="text-xl font-bold text-white">Task ID: {sub.task_id}</h3>
//                   <p className="text-blue-400 font-medium mb-2">Team ID: {sub.team_id}</p>
//                   <div className="bg-zinc-900 p-3 rounded text-sm text-zinc-300 mb-2">
//                     {sub.description || "No description provided."}
//                   </div>
//                   <a href={sub.proof_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white text-xs flex items-center gap-1">
//                     <ExternalLink size={12} /> View Proof
//                   </a>
//                 </div>
                
//                 <div className="flex flex-col items-end gap-2">
//                   <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(sub.id)}>
//                     <Check size={18} /> CONFIRM & AWARD
//                   </Button>
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Submissions;



import React, { useState, useEffect } from 'react';
import { Card, Button, Loader } from '../../components/ui/Components';
import { Check, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const Submissions = () => {
  const { addToast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifiedSubmissions = async () => {
    try {
      const res = await api.get('/submissions/verified');
      setSubmissions(res.data);
    } catch (error) {
      addToast("Failed to load verified submissions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedSubmissions();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/submissions/approve/${id}`);
      addToast(`Submission APPROVED. ${res.data.points_awarded} points awarded.`, "success");
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to approve submission", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Final Approvals</h1>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded">
          No pending approvals from coordinators.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {submissions.map(sub => (
            <Card key={sub.id} className="border-l-4 border-l-blue-500">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">Task ID: {sub.task_id}</h3>
                  <p className="text-blue-400 font-medium mb-2">Team ID: {sub.team_id}</p>
                  
                  {/* ✅ ADD THIS LINE: */}
                  {sub.points_awarded > 0 && <p className="text-yellow-500 font-bold text-sm mb-2">Coordinator Assigned Points: {sub.points_awarded}</p>}
                  
                  <div className="bg-zinc-900 p-3 rounded text-sm text-zinc-300 mb-2 whitespace-pre-wrap">
                    <span className="font-bold text-zinc-500 block mb-1">NOTES:</span>
                    {sub.description || "No description provided."}
                  </div>
                  
                  {/* ONLY SHOW BUTTON IF PROOF URL EXISTS */}
                  {sub.proof_url && sub.proof_url.trim() !== "" && (
                    <a href={sub.proof_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white text-xs flex items-center gap-1">
                      <ExternalLink size={12} /> View Official Proof
                    </a>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(sub.id)}>
                    <Check size={18} /> CONFIRM & AWARD
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;