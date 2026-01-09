import { useState, useEffect, useContext } from "react";
import api from "../api"; // Using your centralized API handler
import { AuthContext } from "../context/AuthContext"; // Using your Auth Context
import { MapPinIcon, CameraIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const ScoutDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("available"); // 'available' or 'mine'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  // Fetch Jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // This uses your api.js which should auto-attach the token
      const res = await api.get("/scouts/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  // Handle Claim Job
  const handleClaim = async (jobId) => {
    if (!window.confirm("Accept this job?")) return;
    try {
      await api.put(`/scouts/jobs/${jobId}/claim`);
      alert("Job Claimed! You are assigned.");
      fetchJobs(); // Refresh list
    } catch (err) {
      alert("Error claiming job. It might be taken.");
    }
  };

  // Handle Upload Photo
  const handleUpload = async (e, jobId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingId(jobId);
    try {
      await api.post(`/scouts/jobs/${jobId}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded! Job Complete. 📸");
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-20">
      
      {/* Mobile Header */}
      <div className="bg-gray-800 p-4 sticky top-0 z-10 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-yellow-400">⚡ SiteSee Scout</h1>
          <p className="text-xs text-gray-400">Agent: {user?.full_name || 'Scout'}</p>
        </div>
        <button onClick={handleLogout} className="text-xs bg-gray-700 px-3 py-1 rounded-full border border-gray-600 hover:bg-gray-600">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2">
        <button 
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${activeTab === 'available' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}
        >
          Available Jobs
        </button>
      </div>

      {/* Job List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-gray-700 rounded-xl border-dashed bg-gray-800/50">
            <CheckCircleIcon className="h-16 w-16 mx-auto mb-2 opacity-20" />
            <p className="text-lg">All clear!</p>
            <p className="text-sm text-gray-600">No pending visits right now.</p>
            <button onClick={fetchJobs} className="mt-6 text-blue-400 text-sm flex items-center justify-center gap-2 mx-auto hover:text-blue-300">
              <ArrowPathIcon className="h-4 w-4" /> Refresh List
            </button>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-xl relative overflow-hidden transition hover:border-gray-600">
              
              {/* Job Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{job.name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                    <MapPinIcon className="h-4 w-4 text-red-500" />
                    {job.address} 
                  </div>
                </div>
                <div className="bg-green-900/80 text-green-400 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wide border border-green-800">
                  Pending
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-gray-900/50 p-3 rounded-lg border-l-4 border-yellow-500 mb-4">
                 <p className="text-xs text-gray-400 uppercase font-bold mb-1">Instructions</p>
                 <p className="text-sm text-gray-200">"{job.instructions}"</p>
                 <p className="text-xs text-gray-500 mt-2">Due: {new Date(job.scheduled_date).toDateString()}</p>
              </div>

              {/* Actions Area */}
              <div className="bg-gray-900/30 p-1 rounded-lg">
                {/* Camera Button */}
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // Opens Back Camera on Mobile
                    onChange={(e) => handleUpload(e, job.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    disabled={uploadingId === job.id}
                  />
                  <button className={`w-full ${uploadingId === job.id ? 'bg-gray-700' : 'bg-blue-600'} text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 shadow-lg transition group-hover:bg-blue-500`}>
                    {uploadingId === job.id ? (
                        <span>Uploading...</span>
                    ) : (
                        <>
                            <CameraIcon className="h-5 w-5" /> 
                            <span>Snap & Complete</span>
                        </>
                    )}
                  </button>
                </div>
              </div>
              
              {job.google_maps_link && (
                 <a href={job.google_maps_link} target="_blank" rel="noreferrer" className="block text-center text-xs text-blue-400 mt-4 hover:text-blue-300 font-bold">
                    Open in Google Maps &rarr;
                 </a>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoutDashboard;