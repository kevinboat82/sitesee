import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { getCurrentGPS, processFilesWithWatermark } from "../utils/watermark";
import {
  MapPinIcon, CameraIcon, CheckCircleIcon, ArrowPathIcon,
  ClockIcon, BanknotesIcon, TrophyIcon, ChartBarIcon,
  DocumentTextIcon, ExclamationTriangleIcon, ShieldCheckIcon,
  Cog6ToothIcon, SunIcon, MoonIcon
} from "@heroicons/react/24/solid";
import { ArrowRightStartOnRectangleIcon, ChevronDownIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Magic UI Components
import GlassCard from "../components/magicui/GlassCard";
import AnimatedGradient from "../components/magicui/AnimatedGradient";
import ScoutBottomNav from "../components/ScoutBottomNav";

const ScoutDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // jobs, history, earnings

  // Earnings data
  const [earnings, setEarnings] = useState({ summary: null, history: [] });
  const [achievements, setAchievements] = useState({ earned: [], all: [], stats: {} });
  const [jobHistory, setJobHistory] = useState([]);

  // State for selected files and notes per job
  const [selectedFiles, setSelectedFiles] = useState({});
  const [scoutNotes, setScoutNotes] = useState({});

  // Wallet state
  const [wallet, setWallet] = useState({ provider: '', number: '' });
  const [walletSaving, setWalletSaving] = useState(false);

  // Authorization Letter Modal
  const [authModal, setAuthModal] = useState({ open: false, letter: null });
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Claimed jobs state
  const [claimedJobs, setClaimedJobs] = useState({});
  const [claimingJob, setClaimingJob] = useState({});

  const handleClaimJob = async (jobId) => {
    setClaimingJob(prev => ({ ...prev, [jobId]: true }));
    try {
      const res = await api.put(`/scouts/jobs/${jobId}/claim`);
      setClaimedJobs(prev => ({ ...prev, [jobId]: true }));
      // If already claimed by this user, just mark as claimed
      if (res.data.alreadyClaimed) {
        console.log('Job was already claimed by you');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to claim job';
      alert(errorMsg);
      // If job is no longer available, refresh the list
      if (err.response?.status === 400 || err.response?.status === 404) {
        fetchJobs(true);
      }
    } finally {
      setClaimingJob(prev => ({ ...prev, [jobId]: false }));
    }
  };

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

  // Fetch Earnings
  const fetchEarnings = async () => {
    try {
      const res = await api.get("/scouts/earnings");
      setEarnings(res.data);
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
  };

  // Fetch Achievements
  const fetchAchievements = async () => {
    try {
      const res = await api.get("/scouts/achievements");
      setAchievements(res.data);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    }
  };

  // Fetch Job History
  const fetchHistory = async () => {
    try {
      const res = await api.get("/scouts/history");
      setJobHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchEarnings();
    fetchAchievements();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle File Selection with Watermarking
  const handleFileSelect = async (e, jobId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Show processing indicator
    setUploadingId(jobId);

    try {
      // Get GPS coordinates
      const gps = await getCurrentGPS();

      // Process images with watermarks
      const watermarkedFiles = await processFilesWithWatermark(files, gps);

      setSelectedFiles(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), ...watermarkedFiles]
      }));
    } catch (err) {
      console.error('Error processing files:', err);
      // Fallback to original files
      setSelectedFiles(prev => ({
        ...prev,
        [jobId]: [...(prev[jobId] || []), ...files]
      }));
    } finally {
      setUploadingId(null);
    }

    e.target.value = "";
  };

  const clearSelection = (jobId) => {
    setSelectedFiles(prev => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
    setScoutNotes(prev => {
      const next = { ...prev };
      delete next[jobId];
      return next;
    });
  };

  // Handle Upload with Notes
  const handleUpload = async (jobId) => {
    const files = selectedFiles[jobId];
    if (!files || files.length === 0) return;

    const videoCount = files.filter(f => f.type.startsWith('video')).length;
    const imageCount = files.filter(f => f.type.startsWith('image')).length;

    if (imageCount < 5 || videoCount < 2) {
      if (!window.confirm(`⚠️ Recommendation Check\n\nYou captured:\n- ${imageCount} Photos (Goal: 5+)\n- ${videoCount} Videos (Goal: 2+)\n\nDo you want to submit anyway?`)) {
        return;
      }
    }

    const formData = new FormData();
    files.forEach(file => formData.append("media", file));
    formData.append("notes", scoutNotes[jobId] || '');

    setUploadingId(jobId);
    try {
      await api.post(`/scouts/jobs/${jobId}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`✅ GREAT JOB!\n\n${files.length} captured media files uploaded successfully.\nVisit marked as complete.`);
      clearSelection(jobId);
      fetchJobs();
      fetchEarnings();
      fetchAchievements();
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed. Please check your connection and try again.");
    } finally {
      setUploadingId(null);
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'OVERDUE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'TODAY': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'OVERDUE': return '🔴 Overdue';
      case 'TODAY': return '🟡 Today';
      default: return '🟢 Upcoming';
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {darkMode && (
          <AnimatedGradient
            colors={["#f59e0b", "#ea580c", "#dc2626"]}
            speed={20}
            blur="heavy"
          />
        )}
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-2xl transition-colors duration-500 ${darkMode
        ? 'bg-slate-950/80 border-white/5'
        : 'bg-white/80 border-gray-200'
        } border-b`}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <img src="/scout-logo.png" alt="SiteSee Scout" className="h-9 w-auto" />
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'Scout'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode
                ? 'text-white/60 hover:bg-white/10 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-amber-500/20">
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </button>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 text-sm ml-2 px-3 py-2 rounded-xl transition-all duration-300 ${darkMode
                ? 'text-white/60 hover:bg-red-500/10 hover:text-red-400'
                : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                }`}
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8 pb-28">

        {/* Earnings Card */}
        <div className={`rounded-2xl p-5 border mb-6 ${darkMode ? 'bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/20' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-white border-amber-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-amber-500" />
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>Your Earnings</h3>
            </div>
            <button
              onClick={() => setActiveTab('earnings')}
              className="text-xs text-amber-500 hover:text-amber-600 font-medium"
            >
              View Details →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                GHS {parseFloat(earnings.summary?.week_total || 0).toFixed(0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>This Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">
                GHS {parseFloat(earnings.summary?.month_total || 0).toFixed(0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>This Month</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                GHS {parseFloat(earnings.summary?.pending_payout || 0).toFixed(0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Pending</p>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {achievements.earned.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrophyIcon className="h-4 w-4 text-amber-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>Your Badges</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {achievements.earned.map((ach, i) => (
                <div
                  key={i}
                  className={`flex-shrink-0 rounded-xl px-3 py-2 flex items-center gap-2 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}
                  title={ach.description}
                >
                  <span className="text-xl">{ach.icon}</span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b pb-4 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          {[
            { id: 'jobs', label: 'Available Jobs', count: jobs.length },
            { id: 'history', label: 'Completed', count: jobHistory.length },
            { id: 'wallet', label: '💳 Wallet', count: 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                ? darkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'
                : darkMode ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs ${activeTab === tab.id ? (darkMode ? 'text-black/60' : 'text-white/60') : (darkMode ? 'text-white/30' : 'text-gray-400')}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className={`ml-auto flex items-center gap-2 text-sm transition-colors duration-300 ${darkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className={`w-8 h-8 border-2 rounded-full animate-spin ${darkMode ? 'border-white/20 border-t-amber-400' : 'border-gray-200 border-t-amber-500'}`}></div>
                <p className={`mt-4 text-sm ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className={`text-center py-16 px-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <CheckCircleIcon className={`h-8 w-8 ${darkMode ? 'text-white/30' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>All Clear!</h3>
                <p className={`text-sm mt-2 max-w-xs mx-auto ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  No pending jobs right now. Check back later or pull to refresh.
                </p>
              </div>
            ) : (
              jobs.map((job, index) => {
                const currentFiles = selectedFiles[job.id] || [];
                const hasFiles = currentFiles.length > 0;
                const imgCount = currentFiles.filter(f => f.type.startsWith('image')).length;
                const vidCount = currentFiles.filter(f => f.type.startsWith('video')).length;
                const isClaimed = claimedJobs[job.id];

                return (
                  <div
                    key={job.id}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-5">
                      {/* Header with Priority */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-white group-hover:text-amber-300' : 'text-gray-900 group-hover:text-amber-600'}`}>
                              {job.name}
                            </h3>
                            {isClaimed && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-500 rounded-full">
                                ✓ CLAIMED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <MapPinIcon className="h-3.5 w-3.5 text-red-500" />
                            <span className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{job.address}</span>
                          </div>
                        </div>
                        {/* Priority Badge */}
                        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${getPriorityColor(job.priority)}`}>
                          {getPriorityLabel(job.priority)}
                        </div>
                      </div>

                      {/* Instructions Card */}
                      <div className={`rounded-xl p-4 mb-4 border-l-2 border-amber-500 ${darkMode ? 'bg-black/30' : 'bg-amber-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs text-amber-500 font-medium">{formatDate(job.scheduled_date)}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                          "{job.instructions || 'Standard site inspection'}"
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {job.google_maps_link && (
                          <a
                            href={job.google_maps_link}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex-1 py-2.5 rounded-xl text-center text-sm font-medium transition-all flex items-center justify-center gap-2 ${darkMode ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600'}`}
                          >
                            <MapPinIcon className="h-4 w-4" />
                            Navigate
                          </a>
                        )}
                        <button
                          className={`px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${darkMode ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600'}`}
                          onClick={async () => {
                            setLoadingAuth(true);
                            try {
                              const res = await api.get(`/scouts/jobs/${job.id}/authorization`);
                              setAuthModal({ open: true, letter: res.data });
                            } catch (err) {
                              alert('Could not load authorization letter');
                            } finally {
                              setLoadingAuth(false);
                            }
                          }}
                          disabled={loadingAuth}
                        >
                          <ShieldCheckIcon className="h-4 w-4" />
                          Show Auth
                        </button>
                        <button
                          className={`px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400' : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'}`}
                          onClick={async () => {
                            const reason = prompt('Why are you aborting this mission?\n\nValid reasons:\n- Hostile/threatening people at location\n- "Keep Off" or warning signs\n- Unsafe environment\n- Other safety concern');
                            if (!reason) return;
                            if (!confirm('Are you sure you want to abort? You will receive GHS 10 show-up fee.')) return;
                            try {
                              await api.post(`/scouts/jobs/${job.id}/abort`, { reason });
                              alert('Mission aborted. GHS 10 show-up fee credited.');
                              fetchJobs(true);
                            } catch (err) {
                              alert('Error aborting mission');
                            }
                          }}
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Abort
                        </button>
                      </div>

                      {/* Media Selection & Notes */}
                      <div className="space-y-3">
                        {/* File Preview */}
                        {hasFiles && (
                          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Captured Media</span>
                              <button
                                onClick={() => clearSelection(job.id)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <div className={`flex-1 rounded-lg p-2 text-center border ${imgCount >= 5 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                <p className="text-lg font-bold">{imgCount}</p>
                                <p className="text-[10px] uppercase opacity-70">Photos (5+)</p>
                              </div>
                              <div className={`flex-1 rounded-lg p-2 text-center border ${vidCount >= 2 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                <p className="text-lg font-bold">{vidCount}</p>
                                <p className="text-[10px] uppercase opacity-70">Videos (2+)</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes Field */}
                        {hasFiles && (
                          <div className={`rounded-xl p-4 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                              <DocumentTextIcon className="h-3.5 w-3.5" />
                              Scout Notes (Optional)
                            </label>
                            <textarea
                              value={scoutNotes[job.id] || ''}
                              onChange={(e) => setScoutNotes(prev => ({ ...prev, [job.id]: e.target.value }))}
                              placeholder="Add observations... (e.g., 'Foundation complete, workers on-site, materials delivered')"
                              className={`w-full border rounded-lg p-3 text-sm focus:outline-none focus:border-amber-500/50 resize-none ${darkMode ? 'bg-black/30 border-white/10 text-white placeholder:text-white/30' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                              rows={2}
                            />
                          </div>
                        )}

                        {/* CLAIM BUTTON - Show when not claimed */}
                        {!isClaimed && !hasFiles && (
                          <button
                            onClick={() => handleClaimJob(job.id)}
                            disabled={claimingJob[job.id]}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black rounded-xl font-bold text-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            {claimingJob[job.id] ? (
                              <>
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                Claiming...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-5 w-5" />
                                Claim This Job
                              </>
                            )}
                          </button>
                        )}

                        {/* Capture Buttons - Only show AFTER claiming */}
                        {isClaimed && (!hasFiles || uploadingId !== job.id) && (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handleFileSelect(e, job.id)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <button className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 transition-all border ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/5' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200'}`}>
                                <CameraIcon className="h-5 w-5 text-amber-400" />
                                <span>Snap Photo</span>
                              </button>
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="video/*"
                                capture="environment"
                                onChange={(e) => handleFileSelect(e, job.id)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <button className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 transition-all border ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/5' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-200'}`}>
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                  <div className="absolute w-4 h-4 rounded-full border-2 border-red-500"></div>
                                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                </div>
                                <span>Rec Video</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Submit Button */}
                        {hasFiles && (
                          <button
                            onClick={() => handleUpload(job.id)}
                            disabled={uploadingId === job.id}
                            className={`w-full py-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2.5 transition-all duration-300 ${uploadingId === job.id
                              ? 'bg-white/10 text-white/50 cursor-wait'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
                              }`}
                          >
                            {uploadingId === job.id ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-5 w-5" />
                                Submit {currentFiles.length} Captures
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {jobHistory.length === 0 ? (
              <div className={`text-center py-16 px-6 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <p className={darkMode ? 'text-white/40' : 'text-gray-500'}>No completed jobs yet. Complete your first job to see it here!</p>
              </div>
            ) : (
              jobHistory.map((job, index) => (
                <div
                  key={job.id}
                  className={`rounded-2xl p-5 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{job.name}</h4>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{job.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-bold">GHS 25</span>
                      <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                        {new Date(job.completed_at).toLocaleDateString()}
                      </p>
                      <div className="mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                          job.status === 'PENDING_APPROVAL' ? 'bg-purple-500/20 text-purple-500' :
                            darkMode ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {job.status === 'PENDING_APPROVAL' ? 'Pending Review' : job.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {job.scout_notes && (
                    <div className={`rounded-lg p-3 mt-3 ${darkMode ? 'bg-black/20' : 'bg-gray-50'}`}>
                      <p className={`text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Your Notes:</p>
                      <p className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>{job.scout_notes}</p>
                    </div>
                  )}
                  <div className={`flex items-center gap-3 mt-3 text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                    <span>📸 {job.media_count || 0} media</span>
                    {job.client_rating && (
                      <span className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {job.client_rating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-white/10' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'}`}>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>💰 Payout Settings</h3>
              <p className={`text-sm mb-6 ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>Add your mobile money details to receive payments for completed jobs.</p>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>Mobile Money Provider</label>
                  <select
                    value={wallet.provider}
                    onChange={(e) => setWallet({ ...wallet, provider: e.target.value })}
                    className={`w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${darkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                  >
                    <option value="">Select Provider...</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="VODAFONE">Vodafone Cash</option>
                    <option value="AIRTELTIGO">AirtelTigo Money</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>Mobile Money Number</label>
                  <input
                    type="tel"
                    value={wallet.number}
                    onChange={(e) => setWallet({ ...wallet, number: e.target.value })}
                    placeholder="e.g. 0241234567"
                    className={`w-full rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${darkMode ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30' : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!wallet.provider || !wallet.number) {
                      alert('Please fill in all fields');
                      return;
                    }
                    setWalletSaving(true);
                    try {
                      await api.put('/scouts/wallet', { provider: wallet.provider, number: wallet.number });
                      alert('Wallet saved successfully!');
                    } catch (err) {
                      alert('Error saving wallet');
                    } finally {
                      setWalletSaving(false);
                    }
                  }}
                  disabled={walletSaving}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-3 rounded-xl font-bold transition-all"
                >
                  {walletSaving ? 'Saving...' : 'Save Wallet Details'}
                </button>
              </div>
            </div>

            <div className={`rounded-2xl p-6 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How Payouts Work</h4>
              <ul className={`space-y-3 text-sm ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500">1.</span>
                  Complete a job and submit photos/videos
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500">2.</span>
                  Client reviews and approves your submission
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500">3.</span>
                  GHS 25 is credited to your account
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500">4.</span>
                  Request withdrawal to your mobile money
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </main>

      {/* Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Authorization Letter Modal */}
      {authModal.open && authModal.letter && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAuthModal({ open: false, letter: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Official Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">SiteSee</h2>
              <p className="text-sm text-gray-500">Property Monitoring Services</p>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                <ShieldCheckIcon className="h-4 w-4" />
                OFFICIAL AUTHORIZATION
              </div>
            </div>

            {/* Letter Content */}
            <div className="text-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-center text-gray-900">LETTER OF AUTHORITY</h3>

              <p className="text-sm leading-relaxed">
                I, <span className="font-bold text-gray-900">{authModal.letter.ownerName}</span>, owner of the property known as
                <span className="font-bold text-gray-900"> "{authModal.letter.propertyName}"</span> located at:
              </p>

              <div className="bg-gray-100 rounded-lg p-3 text-sm font-medium text-gray-800">
                📍 {authModal.letter.propertyAddress}
              </div>

              <p className="text-sm leading-relaxed">
                hereby authorize <span className="font-bold text-amber-600">{authModal.letter.scoutName}</span> from
                <span className="font-bold"> SiteSee Property Monitoring</span> to enter the premises and take
                photographs/videos for monitoring purposes.
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Date Issued</p>
                  <p className="font-semibold text-gray-900">{authModal.letter.date}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs">Owner Contact</p>
                  <p className="font-semibold text-gray-900">{authModal.letter.ownerPhone}</p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 text-center">
                  Visit ID: {authModal.letter.visitId?.slice(0, 8)}... | Scheduled: {new Date(authModal.letter.scheduledDate).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  Verify at sitesee.app or call +233 XX XXX XXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <ScoutBottomNav />
    </div>
  );
};

export default ScoutDashboard;