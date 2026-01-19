import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  ExclamationTriangleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [health, setHealth] = useState(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  // Gallery Modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [allMedia, setAllMedia] = useState([]);

  // Rating Modal
  const [ratingModal, setRatingModal] = useState({ open: false, visitId: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Dispute Modal
  const [disputeModal, setDisputeModal] = useState({ open: false, visitId: null });
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const propRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}`, config);
        setProperty(propRes.data);

        const visitRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/visits`, config);
        setVisits(visitRes.data);

        // Build media array from all visits
        const mediaList = [];
        visitRes.data.forEach(visit => {
          if (visit.media) {
            visit.media.forEach(m => {
              mediaList.push({ ...m, visitDate: visit.scheduled_date });
            });
          }
        });
        setAllMedia(mediaList);

        // Fetch health score
        try {
          const healthRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/health`, config);
          setHealth(healthRes.data);
        } catch (err) {
          console.error('Health fetch error:', err);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleActivate = async () => {
    if (!window.confirm("Start Monthly Subscription for GHS 50?")) return;

    setActivating(true);
    const safeEmail = user?.email || "client@sitesee.com";

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'https://sitesee-api.onrender.com/api/payments/initialize',
        {
          email: safeEmail,
          amount: 50.00,
          property_id: id,
          plan_type: 'BASIC',
          is_visit: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paystackUrl = res.data.authorization_url || res.data.data?.authorization_url;

      if (paystackUrl && paystackUrl.startsWith('http')) {
        window.location.href = paystackUrl;
      } else {
        alert("Payment Error: The payment provider did not return a link.");
        setActivating(false);
      }

    } catch (err) {
      console.error("Payment Failed:", err);
      const errorMsg = err.response?.data?.error || "Connection Error";
      alert(`Payment Failed: ${errorMsg}`);
      setActivating(false);
    }
  };

  const handleRequestVisit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      const token = localStorage.getItem('token');
      const VISIT_PRICE = 50.00;

      const res = await axios.post(
        'https://sitesee-api.onrender.com/api/payments/initialize',
        {
          email: user?.email,
          amount: VISIT_PRICE,
          property_id: id,
          is_visit: true,
          scheduled_date: visitDate,
          instructions: instructions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        alert("Payment Error: No URL returned");
        setRequestLoading(false);
      }

    } catch (err) {
      alert("Failed to initialize payment.");
      console.error(err);
      setRequestLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setSubmittingRating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://sitesee-api.onrender.com/api/properties/${id}/visits/${ratingModal.visitId}/rate`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Thank you for your feedback!");
      setRatingModal({ open: false, visitId: null });
      setRating(0);
      setComment('');

      // Refresh visits
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const visitRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/visits`, config);
      setVisits(visitRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  // Handle Dispute Submission
  const handleSubmitDispute = async () => {
    if (!disputeReason || !disputeDescription) {
      alert("Please select a reason and provide details");
      return;
    }

    setSubmittingDispute(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://sitesee-api.onrender.com/api/disputes',
        {
          visit_id: disputeModal.visitId,
          reason: disputeReason,
          description: disputeDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Dispute submitted. Our team will review and get back to you.");
      setDisputeModal({ open: false, visitId: null });
      setDisputeReason('');
      setDisputeDescription('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Failed to submit dispute");
    } finally {
      setSubmittingDispute(false);
    }
  };

  const getHealthColor = (score) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="flex gap-2 mb-6">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-white/60 text-sm font-medium">Fetching details...</p>
      </div>
    );
  }

  if (!property) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">{property.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Property Card with Health Score */}
        <div className="bg-white/5 rounded-3xl p-8 border border-white/5 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
              <div className="flex items-center gap-2 text-white/50 mb-6">
                <MapPinIcon className="h-5 w-5" />
                {property.address}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {property.sub_status === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active Monitoring
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/50 text-sm font-medium border border-white/5">
                    Inactive Plan
                  </span>
                )}

                {property.google_maps_link && (
                  <a
                    href={property.google_maps_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                  >
                    Open Maps ↗
                  </a>
                )}
              </div>

              {/* Health Score */}
              {health && (
                <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white/50">Property Health Score</span>
                    <span className={`text-2xl font-bold ${getHealthColor(health.score)}`}>
                      {health.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${health.score >= 70 ? 'bg-emerald-500' : health.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${health.score}%` }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {health.factors?.slice(0, 3).map((factor, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 rounded-full ${factor.status === 'good' ? 'bg-emerald-500/20 text-emerald-400' :
                          factor.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            factor.status === 'bad' ? 'bg-red-500/20 text-red-400' :
                              'bg-white/10 text-white/50'
                          }`}
                      >
                        {factor.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              {property.sub_status === 'ACTIVE' ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Schedule Visit
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {activating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5" />
                      Activate (GHS 50)
                    </>
                  )}
                </button>
              )}

              {/* Gallery Button */}
              {allMedia.length > 0 && (
                <button
                  onClick={() => { setGalleryOpen(true); setCurrentMediaIndex(0); }}
                  className="bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <PhotoIcon className="h-5 w-5" />
                  View Gallery ({allMedia.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Visit History */}
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-white/30" />
          Visit History
        </h3>

        {visits.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/60 mb-2">No visits recorded yet.</p>
            <p className="text-sm text-white/30">
              {property.sub_status === 'ACTIVE'
                ? 'Schedule a visit above to generate a report.'
                : 'Activate your plan to start scheduling visits.'}
            </p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 space-y-8 pb-12">
            {visits.map((visit, index) => (
              <div key={visit.id || index} className="pl-8 relative group">
                {/* Timeline dot */}
                <div className={`absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${visit.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'
                  } group-hover:scale-150 transition-all`}></div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">
                        {new Date(visit.scheduled_date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </h4>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${visit.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                          visit.status === 'PENDING_APPROVAL' ? 'bg-blue-500/20 text-blue-400' :
                            visit.status === 'REVISION_REQUESTED' ? 'bg-red-500/20 text-red-400' :
                              'bg-amber-500/20 text-amber-400'
                          }`}>
                          {visit.status === 'PENDING_APPROVAL' ? '⏳ Awaiting Approval' :
                            visit.status === 'REVISION_REQUESTED' ? '🔄 Revision Needed' :
                              visit.status || 'PENDING'}
                        </span>
                        {visit.scout_name && (
                          <span className="text-white/40">by {visit.scout_name}</span>
                        )}
                      </div>
                    </div>

                    {/* Approval Actions for PENDING_APPROVAL */}
                    {visit.status === 'PENDING_APPROVAL' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={async () => {
                            if (!confirm('Approve this visit? The scout will be credited GHS 25.')) return;
                            try {
                              const token = localStorage.getItem('token');
                              await axios.put(
                                `https://sitesee-api.onrender.com/api/properties/${id}/visits/${visit.id}/approve`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              alert('Visit approved! Scout has been paid.');
                              window.location.reload();
                            } catch (err) {
                              alert('Error approving visit');
                            }
                          }}
                          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Approve & Pay
                        </button>
                        <button
                          onClick={async () => {
                            const reason = prompt('What changes are needed?');
                            if (!reason) return;
                            try {
                              const token = localStorage.getItem('token');
                              await axios.put(
                                `https://sitesee-api.onrender.com/api/properties/${id}/visits/${visit.id}/reject`,
                                { reason },
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              alert('Revision requested. Scout will be notified.');
                              window.location.reload();
                            } catch (err) {
                              alert('Error requesting revision');
                            }
                          }}
                          className="flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/15 text-white/70 rounded-xl text-sm font-medium transition-all"
                        >
                          Request Changes
                        </button>
                      </div>
                    )}

                    {/* Rating & Actions for COMPLETED */}
                    {visit.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {visit.client_rating ? (
                          <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                            {[1, 2, 3, 4, 5].map(star => (
                              <StarSolid
                                key={star}
                                className={`h-4 w-4 ${star <= visit.client_rating ? 'text-amber-400' : 'text-white/20'}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <button
                            onClick={() => setRatingModal({ open: true, visitId: visit.id })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full text-sm font-medium transition-all"
                          >
                            <StarIcon className="h-4 w-4" />
                            Rate Visit
                          </button>
                        )}
                        <button
                          onClick={() => setDisputeModal({ open: true, visitId: visit.id })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-sm font-medium transition-all"
                        >
                          <FlagIcon className="h-4 w-4" />
                          Report Issue
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scout Notes */}
                  {visit.scout_notes && (
                    <div className="bg-black/20 rounded-lg p-4 mb-4 border-l-2 border-amber-500">
                      <div className="flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="h-4 w-4 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Scout Notes</span>
                      </div>
                      <p className="text-sm text-white/70">{visit.scout_notes}</p>
                    </div>
                  )}

                  {/* Client Comment */}
                  {visit.client_comment && (
                    <div className="bg-blue-500/10 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ChatBubbleLeftIcon className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs text-blue-400">Your Comment</span>
                      </div>
                      <p className="text-sm text-white/70">{visit.client_comment}</p>
                    </div>
                  )}

                  {/* Media Gallery */}
                  {visit.media && visit.media.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {visit.media.slice(0, 4).map((m, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const mediaIdx = allMedia.findIndex(am => am.url === m.url);
                              setCurrentMediaIndex(mediaIdx >= 0 ? mediaIdx : 0);
                              setGalleryOpen(true);
                            }}
                            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all group"
                          >
                            {m.type === 'VIDEO' ? (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <PlayCircleIcon className="h-10 w-10 text-white/50 group-hover:text-white transition-colors" />
                              </div>
                            ) : (
                              <img
                                src={m.url}
                                alt={`Visit media ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            )}
                            {i === 3 && visit.media.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white font-bold">+{visit.media.length - 4}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Schedule Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Schedule Visit</h2>

            <form onSubmit={handleRequestVisit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">When should we go?</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Special Instructions</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                  rows="3"
                  placeholder="e.g. Please check the foundation progress..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={requestLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                {requestLoading ? 'Processing...' : 'Confirm & Pay GHS 50'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => { setRatingModal({ open: false, visitId: null }); setRating(0); setComment(''); }}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Rate This Visit</h2>
            <p className="text-white/50 text-sm mb-6">Let us know how the scout did!</p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  {star <= rating ? (
                    <StarSolid className="h-10 w-10 text-amber-400" />
                  ) : (
                    <StarIcon className="h-10 w-10 text-white/30 hover:text-amber-400/50" />
                  )}
                </button>
              ))}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">Add a comment (optional)</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-white/20"
                rows="3"
                placeholder="Great job, very thorough inspection..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmitRating}
              disabled={submittingRating || rating === 0}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black py-3.5 rounded-xl font-bold transition-all"
            >
              {submittingRating ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => { setDisputeModal({ open: false, visitId: null }); setDisputeReason(''); setDisputeDescription(''); }}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Report an Issue</h2>
                <p className="text-white/50 text-sm">We'll review and get back to you</p>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">What went wrong?</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              >
                <option value="">Select a reason...</option>
                <option value="incomplete_work">Incomplete Work</option>
                <option value="poor_quality">Poor Quality Photos/Videos</option>
                <option value="wrong_location">Wrong Location Visited</option>
                <option value="scout_behavior">Unprofessional Behavior</option>
                <option value="late_delivery">Late Submission</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/70 mb-2">Describe the issue</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-white/20"
                rows="4"
                placeholder="Please provide details about what went wrong..."
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
              />
            </div>

            <button
              onClick={handleSubmitDispute}
              disabled={submittingDispute || !disputeReason || !disputeDescription}
              className="w-full bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all"
            >
              {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </div>
      )}
      {galleryOpen && allMedia.length > 0 && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            onClick={() => setGalleryOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-50 p-2"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          {/* Navigation */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={() => setCurrentMediaIndex(prev => (prev - 1 + allMedia.length) % allMedia.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={() => setCurrentMediaIndex(prev => (prev + 1) % allMedia.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Media Display */}
          <div className="max-w-5xl max-h-[80vh] w-full mx-4">
            {allMedia[currentMediaIndex]?.type === 'VIDEO' ? (
              <video
                src={allMedia[currentMediaIndex].url}
                controls
                className="max-h-[80vh] mx-auto rounded-lg"
              />
            ) : (
              <img
                src={allMedia[currentMediaIndex]?.url}
                alt="Visit media"
                className="max-h-[80vh] mx-auto rounded-lg object-contain"
              />
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
            {currentMediaIndex + 1} / {allMedia.length}
          </div>

          {/* Thumbnail strip */}
          {allMedia.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
              {allMedia.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentMediaIndex(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentMediaIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                >
                  {m.type === 'VIDEO' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <PlayCircleIcon className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PropertyDetails;