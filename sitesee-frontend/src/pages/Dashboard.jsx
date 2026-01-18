import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HomeModernIcon, PlusIcon, MapPinIcon, ArrowRightIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, authLoading } = useContext(AuthContext); // Added user, authLoading
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingPropertyId, setPayingPropertyId] = useState(null);

  // Redirect Admins
  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      navigate('/admin');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        // Wait for auth loading to confirm role (optional but safer)
        if (authLoading) return;

        const res = await axios.get('https://sitesee-api.onrender.com/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setData(res.data);
        setLoading(false);

        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'success') {
          alert("Payment Successful! Your property is now being monitored 🚀");
          window.history.replaceState({}, document.title, "/dashboard");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate, location]);

  const handleSubscribe = async (propertyId) => {
    if (!window.confirm("Start Monthly Subscription for GHS 50?")) return;

    setPayingPropertyId(propertyId);
    const safeEmail = data?.user?.email || "client@sitesee.com";

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        'https://sitesee-api.onrender.com/api/payments/initialize',
        {
          email: safeEmail,
          amount: 50.00,
          property_id: propertyId,
          plan_type: 'BASIC',
          is_visit: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paystackUrl = res.data.authorization_url || res.data.data?.authorization_url;

      if (paystackUrl && paystackUrl.startsWith('http')) {
        window.location.href = paystackUrl;
      } else {
        alert("Error: Payment link not found.");
        setPayingPropertyId(null);
      }

    } catch (err) {
      console.error("Payment Error:", err);
      alert(err.response?.data?.error || "Failed to start payment");
      setPayingPropertyId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Playful Loading Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        {/* Bouncing dots animation */}
        <div className="flex gap-2 mb-6">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-white/60 text-sm font-medium">Loading your properties...</p>

        {/* Fun messages that cycle */}
        <div className="mt-8 text-white/30 text-xs animate-pulse">
          ✨ Making things beautiful for you
        </div>
      </div>
    );
  }

  const activeCount = data?.properties?.filter(p => p.sub_status === 'ACTIVE').length || 0;
  const totalCount = data?.properties?.length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <HomeModernIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">SiteSee</h1>
              <p className="text-xs text-white/40">Property Monitoring</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/5"
          >
            <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Greeting */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Hello, {data?.user?.full_name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-white/50">
            {activeCount > 0
              ? `You have ${activeCount} active ${activeCount === 1 ? 'property' : 'properties'} being monitored.`
              : "Let's get your properties monitored."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
            <p className="text-3xl font-bold text-white">{totalCount}</p>
            <p className="text-sm text-white/40 mt-1">Total Properties</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-5 border border-blue-500/20">
            <p className="text-3xl font-bold text-blue-400">{activeCount}</p>
            <p className="text-sm text-white/40 mt-1">Active Plans</p>
          </div>
        </div>

        {/* Properties Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white/90">Your Properties</h3>
          <button
            onClick={() => navigate('/add-property')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-white/90 transition-all duration-300"
          >
            <PlusIcon className="h-4 w-4" />
            Add Property
          </button>
        </div>

        {/* Properties Grid */}
        <div className="space-y-4">
          {data?.properties?.length > 0 ? (
            data.properties.map((prop, index) => (
              <div
                key={prop.id}
                className="group bg-white/5 hover:bg-white/8 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-500 cursor-pointer"
                onClick={() => navigate(`/property/${prop.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">
                        {prop.name}
                      </h4>
                      {prop.sub_status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {prop.address}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {prop.sub_status === 'ACTIVE' ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="hidden sm:inline font-medium">Monitored</span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubscribe(prop.id);
                        }}
                        disabled={payingPropertyId === prop.id}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                      >
                        {payingPropertyId === prop.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-4 w-4" />
                            Activate • GHS 50
                          </>
                        )}
                      </button>
                    )}
                    <ArrowRightIcon className="h-5 w-5 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 px-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <HomeModernIcon className="h-8 w-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white/80 mb-2">No properties yet</h3>
              <p className="text-sm text-white/40 mb-6 max-w-xs mx-auto">
                Add your first property to start monitoring with our scouts.
              </p>
              <button
                onClick={() => navigate('/add-property')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-white/90 transition-all duration-300"
              >
                <PlusIcon className="h-4 w-4" />
                Add Your First Property
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Subtle Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Dashboard;