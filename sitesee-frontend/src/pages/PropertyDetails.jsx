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
  XMarkIcon
} from '@heroicons/react/24/outline';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [property, setProperty] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const propRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}`, config);
        setProperty(propRes.data);

        const visitRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/visits`, config);
        setVisits(visitRes.data);

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
          is_visit: true, // One-Time Visit
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

  // Playful Loading Animation
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

        {/* Property Card */}
        <div className="bg-white/5 rounded-3xl p-8 border border-white/5 mb-10 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{property.name}</h2>
              <div className="flex items-center gap-2 text-white/50 mb-6">
                <MapPinIcon className="h-5 w-5" />
                {property.address}
              </div>

              <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>

        {/* Timeline / Visits */}
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
          <div className="relative border-l border-white/10 ml-3 space-y-12 pb-12">
            {visits.map((visit, index) => (
              <div key={index} className="pl-8 relative group">
                {/* Dot on timeline */}
                <div className={`absolute -left-[5px] top-6 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${visit.status === 'COMPLETED' ? 'bg-emerald-500 scale-125' : 'bg-amber-500'} group-hover:scale-150 transition-all`}></div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">
                        {new Date(visit.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${visit.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                          {visit.status || 'PENDING'}
                        </span>
                        {visit.instructions && (
                          <span className="text-white/40 truncate max-w-xs">• "{visit.instructions}"</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo Gallery (Single for now) */}
                  {visit.photo_url ? (
                    <div className="mt-4">
                      <a href={visit.photo_url} target="_blank" rel="noreferrer" className="block w-full sm:w-64 aspect-video rounded-lg overflow-hidden border border-white/10 relative group/img">
                        <img src={visit.photo_url} alt="Site Visit" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold flex items-center gap-1">
                            <PhotoIcon className="h-4 w-4" /> View Full Size
                          </p>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/5 flex items-center gap-3 text-white/30 text-sm italic">
                      <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse"></div>
                      Waiting for scout report...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Modal - Dark Theme */}
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
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all calendar-picker-indicator-invert"
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

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PropertyDetails;