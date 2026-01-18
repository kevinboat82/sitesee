import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { MapPinIcon, CameraIcon, CheckCircleIcon, ArrowPathIcon, ArrowRightIcon, ClockIcon } from "@heroicons/react/24/solid";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ScoutDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Jobs
  const fetchJobs = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get("/scouts/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
      alert("✅ Photo uploaded! Job marked as complete.");
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploadingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">

      {/* Apple-style Header - Frosted Glass */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              <span className="text-amber-400">⚡</span> SiteSee Scout
            </h1>
            <p className="text-xs text-white/50 mt-0.5">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Scout'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-300 px-3 py-2 rounded-full hover:bg-white/10"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10">
            <p className="text-4xl font-bold text-white">{jobs.length}</p>
            <p className="text-sm text-white/50 mt-1">Available Jobs</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-5 border border-amber-500/20">
            <p className="text-4xl font-bold text-amber-400">
              GHS {jobs.length * 50}
            </p>
            <p className="text-sm text-white/50 mt-1">Potential Earnings</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white/90">Available Jobs</h2>
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-300"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin"></div>
              <p className="text-white/40 mt-4 text-sm">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-lg font-medium text-white/80">All Clear!</h3>
              <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto">
                No pending jobs right now. Check back later or pull to refresh.
              </p>
              <button
                onClick={() => fetchJobs(true)}
                className="mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white/80 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
            </div>
          ) : (
            jobs.map((job, index) => (
              <div
                key={job.id}
                className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Job Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors duration-300">
                        {job.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <MapPinIcon className="h-3.5 w-3.5 text-red-400" />
                        <span className="text-sm text-white/50">{job.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Available
                    </div>
                  </div>

                  {/* Instructions Card */}
                  <div className="bg-black/30 rounded-xl p-4 mb-4 border-l-2 border-amber-500">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">{formatDate(job.scheduled_date)}</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      "{job.instructions || 'Standard site inspection'}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {/* Camera/Upload Button */}
                    <div className="relative flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleUpload(e, job.id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploadingId === job.id}
                      />
                      <button
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm flex justify-center items-center gap-2.5 transition-all duration-300 ${uploadingId === job.id
                            ? 'bg-white/10 text-white/50 cursor-wait'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20'
                          }`}
                      >
                        {uploadingId === job.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <CameraIcon className="h-5 w-5" />
                            Capture & Complete
                          </>
                        )}
                      </button>
                    </div>

                    {/* Maps Button */}
                    {job.google_maps_link && (
                      <a
                        href={job.google_maps_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-3.5 bg-white/10 hover:bg-white/15 rounded-xl transition-all duration-300 flex items-center justify-center"
                      >
                        <MapPinIcon className="h-5 w-5 text-white/70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Spacing for Mobile */}
        <div className="h-8"></div>
      </main>

      {/* Subtle Gradient Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default ScoutDashboard;