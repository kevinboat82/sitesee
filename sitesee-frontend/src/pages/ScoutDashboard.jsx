// src/pages/ScoutDashboard.jsx
import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { MapPinIcon, CameraIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Spinner from "../components/Spinner";

const ScoutDashboard = () => {
  const { token, logout, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("available"); // 'available' or 'mine'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch Jobs based on tab
  const fetchJobs = async () => {
    setLoading(true);
    try {
      // NOTE: In a real app, you'd have separate endpoints. 
      // For now, we'll fetch all open jobs for 'available' 
      // We need a specific endpoint for 'my jobs', let's mock the filter for now or assume the API handles it
      // Let's use the endpoint we made: /api/scouts/jobs (This returns PENDING jobs)
      
      const res = await api.get("/scouts/jobs", {
        headers: { "x-auth-token": token },
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  // Handle Claim Job
  const handleClaim = async (jobId) => {
    if (!confirm("Accept this job?")) return;
    try {
      await api.put(`/scouts/jobs/${jobId}/claim`, {}, {
        headers: { "x-auth-token": token },
      });
      alert("Job Claimed!");
      fetchJobs(); // Refresh list
    } catch (err) {
      alert("Error claiming job");
    }
  };

  // Handle Upload Photo
  const handleUpload = async (e, jobId) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      await api.post(`/scouts/jobs/${jobId}/complete`, formData, {
        headers: { 
          "x-auth-token": token,
          "Content-Type": "multipart/form-data" 
        },
      });
      alert("Uploaded! Job Complete.");
      fetchJobs();
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-20">
      
      {/* Mobile Header */}
      <div className="bg-gray-800 p-4 sticky top-0 z-10 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-yellow-400">⚡ SiteSee Scout</h1>
          <p className="text-xs text-gray-400">Rider: {user?.full_name}</p>
        </div>
        <button onClick={logout} className="text-xs bg-gray-700 px-3 py-1 rounded-full">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2">
        <button 
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeTab === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Available Jobs
        </button>
        {/* For this MVP, we will stick to just showing Available jobs to keep it simple. 
            In V2, we add the 'My Jobs' filter. */}
      </div>

      {/* Job List */}
      <div className="p-4 space-y-4">
        {loading ? <Spinner /> : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <CheckCircleIcon className="h-16 w-16 mx-auto mb-2 opacity-20" />
            <p>No pending jobs found.</p>
            <button onClick={fetchJobs} className="mt-4 text-blue-400 text-sm flex items-center justify-center gap-1 mx-auto">
              <ArrowPathIcon className="h-4 w-4" /> Refresh
            </button>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg relative overflow-hidden">
              
              {/* Job Details */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{job.name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                    <MapPinIcon className="h-4 w-4 text-red-400" />
                    {job.gps_location}
                  </div>
                </div>
                <div className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded font-bold uppercase">
                  Pending
                </div>
              </div>

              {/* Actions Area */}
              <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Action Required</p>
                
                {/* 1. Claim Button */}
                <button 
                  onClick={() => handleClaim(job.id)}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg mb-2 shadow-md transition"
                >
                  🖐 Claim This Job
                </button>

                {/* 2. Camera Button (Hidden until claimed in a real app, but open for testing now) */}
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // This opens the back camera on mobile!
                    onChange={(e) => handleUpload(e, job.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <button className="w-full bg-gray-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 border border-gray-600">
                    {uploading ? "Uploading..." : <><CameraIcon className="h-5 w-5" /> Snap Proof</>}
                  </button>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                Contact: {job.caretaker_phone}
              </p>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoutDashboard;