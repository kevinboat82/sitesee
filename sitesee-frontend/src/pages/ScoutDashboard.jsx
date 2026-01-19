import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import {
  MapPinIcon, CameraIcon, CheckCircleIcon, ArrowPathIcon,
  ClockIcon, BanknotesIcon, TrophyIcon, ChartBarIcon,
  DocumentTextIcon, ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import { ArrowRightStartOnRectangleIcon, ChevronDownIcon, StarIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ScoutDashboard = () => {
  const { user, logout } = useContext(AuthContext);
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

  // Handle File Selection
  const handleFileSelect = (e, jobId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(prev => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), ...files]
    }));
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
    <div className="min-h-screen bg-[#000000] text-white font-sans">

      {/* Header */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-300 px-2 py-2 rounded-full hover:bg-white/10"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-xs font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors duration-300 px-3 py-2 rounded-full hover:bg-white/10"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-2xl p-5 border border-amber-500/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-white/80">Your Earnings</h3>
            </div>
            <button
              onClick={() => setActiveTab('earnings')}
              className="text-xs text-amber-400 hover:text-amber-300"
            >
              View Details →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                GHS {parseFloat(earnings.summary?.week_total || 0).toFixed(0)}
              </p>
              <p className="text-xs text-white/40">This Week</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">
                GHS {parseFloat(earnings.summary?.month_total || 0).toFixed(0)}
              </p>
              <p className="text-xs text-white/40">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white/60">
                GHS {parseFloat(earnings.summary?.pending_payout || 0).toFixed(0)}
              </p>
              <p className="text-xs text-white/40">Pending</p>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {achievements.earned.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrophyIcon className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/70">Your Badges</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {achievements.earned.map((ach, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2"
                  title={ach.description}
                >
                  <span className="text-xl">{ach.icon}</span>
                  <span className="text-xs font-medium text-white/70">{ach.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {[
            { id: 'jobs', label: 'Available Jobs', count: jobs.length },
            { id: 'history', label: 'Completed', count: jobHistory.length },
            { id: 'wallet', label: '💳 Wallet', count: 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                ? 'bg-white text-black'
                : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs ${activeTab === tab.id ? 'text-black/60' : 'text-white/30'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => fetchJobs(true)}
            disabled={refreshing}
            className="ml-auto flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-300"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
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
              </div>
            ) : (
              jobs.map((job, index) => {
                const currentFiles = selectedFiles[job.id] || [];
                const hasFiles = currentFiles.length > 0;
                const imgCount = currentFiles.filter(f => f.type.startsWith('image')).length;
                const vidCount = currentFiles.filter(f => f.type.startsWith('video')).length;

                return (
                  <div
                    key={job.id}
                    className="group bg-gradient-to-br from-white/10 to-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-5">
                      {/* Header with Priority */}
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
                        {/* Priority Badge */}
                        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${getPriorityColor(job.priority)}`}>
                          {getPriorityLabel(job.priority)}
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

                      {/* Quick Actions */}
                      <div className="flex gap-2 mb-4">
                        {job.google_maps_link && (
                          <a
                            href={job.google_maps_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-center text-sm font-medium text-blue-400 transition-all flex items-center justify-center gap-2"
                          >
                            <MapPinIcon className="h-4 w-4" />
                            Start Navigation
                          </a>
                        )}
                        <button
                          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all flex items-center gap-2"
                          onClick={() => alert('Feature: Report issue - Coming soon!')}
                        >
                          <ExclamationTriangleIcon className="h-4 w-4" />
                          Report Issue
                        </button>
                      </div>

                      {/* Media Selection & Notes */}
                      <div className="space-y-3">
                        {/* File Preview */}
                        {hasFiles && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Captured Media</span>
                              <button
                                onClick={() => clearSelection(job.id)}
                                className="text-xs text-red-400 hover:text-red-300 font-medium"
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
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <label className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                              <DocumentTextIcon className="h-3.5 w-3.5" />
                              Scout Notes (Optional)
                            </label>
                            <textarea
                              value={scoutNotes[job.id] || ''}
                              onChange={(e) => setScoutNotes(prev => ({ ...prev, [job.id]: e.target.value }))}
                              placeholder="Add observations... (e.g., 'Foundation complete, workers on-site, materials delivered')"
                              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
                              rows={2}
                            />
                          </div>
                        )}

                        {/* Capture Buttons */}
                        {(!hasFiles || uploadingId !== job.id) && (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => handleFileSelect(e, job.id)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <button className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5">
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
                              <button className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5">
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
              <div className="text-center py-16 px-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-white/40">No completed jobs yet. Complete your first job to see it here!</p>
              </div>
            ) : (
              jobHistory.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-white/5 rounded-2xl p-5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white">{job.name}</h4>
                      <p className="text-xs text-white/40 mt-1">{job.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold">GHS 25</span>
                      <p className="text-xs text-white/40">
                        {new Date(job.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {job.scout_notes && (
                    <div className="bg-black/20 rounded-lg p-3 mt-3">
                      <p className="text-xs text-white/50 mb-1">Your Notes:</p>
                      <p className="text-sm text-white/70">{job.scout_notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
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
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">💰 Payout Settings</h3>
              <p className="text-white/60 text-sm mb-6">Add your mobile money details to receive payments for completed jobs.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Mobile Money Provider</label>
                  <select
                    value={wallet.provider}
                    onChange={(e) => setWallet({ ...wallet, provider: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select Provider...</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="VODAFONE">Vodafone Cash</option>
                    <option value="AIRTELTIGO">AirtelTigo Money</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Mobile Money Number</label>
                  <input
                    type="tel"
                    value={wallet.number}
                    onChange={(e) => setWallet({ ...wallet, number: e.target.value })}
                    placeholder="e.g. 0241234567"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-white/30"
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

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">How Payouts Work</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400">1.</span>
                  Complete a job and submit photos/videos
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400">2.</span>
                  Client reviews and approves your submission
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400">3.</span>
                  GHS 25 is credited to your account
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400">4.</span>
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
    </div>
  );
};

export default ScoutDashboard;