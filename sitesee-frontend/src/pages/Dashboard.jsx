import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
  HomeModernIcon, PlusIcon, MapPinIcon, ArrowRightIcon,
  CheckCircleIcon, SparklesIcon, BellIcon, ChartBarIcon,
  CalendarDaysIcon, ClockIcon, SunIcon, MoonIcon
} from '@heroicons/react/24/outline';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

// Magic UI Components
import GlassCard from '../components/magicui/GlassCard';
import { SpotlightCard } from '../components/magicui/Spotlight';
import AnimatedGradient from '../components/magicui/AnimatedGradient';
import BottomNav from '../components/BottomNav';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, authLoading } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingPropertyId, setPayingPropertyId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [healthScores, setHealthScores] = useState({});
  const [activeTab, setActiveTab] = useState('properties');

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

        if (authLoading) return;

        const res = await axios.get('https://sitesee-api.onrender.com/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setData(res.data);
        setLoading(false);

        // Fetch health scores
        if (res.data?.properties) {
          res.data.properties.forEach(async (prop) => {
            try {
              const healthRes = await axios.get(
                `https://sitesee-api.onrender.com/api/properties/${prop.id}/health`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setHealthScores(prev => ({ ...prev, [prop.id]: healthRes.data }));
            } catch (err) {
              console.error('Health fetch error:', err);
            }
          });
        }

        // Fetch activity feed
        try {
          const activityRes = await axios.get('https://sitesee-api.onrender.com/api/activity', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setActivities(activityRes.data);
        } catch (err) {
          console.error('Activity fetch error:', err);
        }

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
  }, [navigate, location, authLoading]);

  // Check for pending approvals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (data?.reports) {
      const count = data.reports.filter(r => r.status === 'PENDING_APPROVAL').length;
      setPendingCount(count);
      if (count > 0) {
        setShowApprovalModal(true);
      }
    }
  }, [data]);

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

  const getHealthColor = (score) => {
    if (score >= 70) return darkMode ? 'text-emerald-400' : 'text-emerald-600';
    if (score >= 40) return darkMode ? 'text-amber-400' : 'text-amber-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getHealthBg = (score) => {
    if (score >= 70) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 40) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'VISIT_COMPLETED': return '✅';
      case 'VISIT_SCHEDULED': return '📅';
      case 'PHOTO_UPLOADED': return '📸';
      default: return '🔔';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading Animation
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="flex gap-2 mb-6">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className={`text-sm font-medium ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
          Loading your properties...
        </p>
      </div>
    );
  }

  const activeCount = data?.properties?.filter(p => p.sub_status === 'ACTIVE').length || 0;
  const totalCount = data?.properties?.length || 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {darkMode ? (
          <AnimatedGradient
            colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
            speed={15}
            blur="heavy"
          />
        ) : (
          <div className="absolute inset-0 gradient-mesh opacity-50" />
        )}
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-2xl transition-colors duration-500 ${darkMode
        ? 'bg-slate-950/80 border-white/5'
        : 'bg-white/80 border-gray-200'
        } border-b`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/sitesee-logo.png" alt="SiteSee" className="h-9 w-auto" />
          </div>

          <div className="flex items-center gap-1">
            {/* Profile */}
            <button
              onClick={() => navigate('/profile')}
              className={`p-2 rounded-xl transition-all duration-300 ${darkMode
                ? 'hover:bg-white/10'
                : 'hover:bg-gray-100'
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20">
                {data?.user?.full_name?.charAt(0)?.toUpperCase() || '?'}
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
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 pb-28">

        {/* Greeting */}
        <div className="mb-10 animate-fade-up">
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Hello, {data?.user?.full_name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className={darkMode ? 'text-white/50' : 'text-gray-500'}>
            {activeCount > 0
              ? `You have ${activeCount} active ${activeCount === 1 ? 'property' : 'properties'} being monitored.`
              : "Let's get your properties monitored."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <GlassCard className="p-5" hover={true}>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{totalCount}</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Total Properties</p>
          </GlassCard>

          <GlassCard className="p-5 !bg-gradient-to-br !from-blue-500/20 !to-cyan-500/10 !border-blue-500/20" glow={true} glowColor="blue">
            <p className="text-3xl font-bold text-blue-500">{activeCount}</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Active Plans</p>
          </GlassCard>

          <GlassCard className="p-5" hover={true}>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activities.length}</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>Recent Updates</p>
          </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'properties', label: 'Properties', icon: HomeModernIcon },
            { id: 'activity', label: 'Activity', icon: BellIcon, badge: activities.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                ? darkMode
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'bg-gray-900 text-white shadow-lg'
                : darkMode
                  ? 'text-white/50 hover:text-white hover:bg-white/10'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge > 0 && activeTab !== tab.id && (
                <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => navigate('/add-property')}
            className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg ${darkMode
              ? 'bg-white text-slate-900 hover:bg-white/90 shadow-white/10'
              : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'
              }`}
          >
            <PlusIcon className="h-4 w-4" />
            Add Property
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {data?.properties?.length > 0 ? (
              data.properties.map((prop, index) => {
                const health = healthScores[prop.id];

                return (
                  <SpotlightCard
                    key={prop.id}
                    spotlightColor={darkMode ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.05)"}
                    className={`group rounded-2xl transition-all duration-500 cursor-pointer animate-fade-up ${darkMode
                      ? 'bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/15'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/property/${prop.id}`)}
                  >
                    <div className="relative z-10 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-lg font-semibold transition-colors duration-300 ${darkMode
                              ? 'text-white group-hover:text-blue-400'
                              : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                              {prop.name}
                            </h4>
                            {prop.sub_status === 'ACTIVE' ? (
                              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-500 text-xs px-2.5 py-1 rounded-full font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${darkMode ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'
                                }`}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                            <MapPinIcon className="h-4 w-4" />
                            {prop.address}
                          </div>

                          {/* Health Score */}
                          {health && (
                            <div className="mt-4 flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getHealthBg(health.score)} flex items-center justify-center border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                <span className={`text-lg font-bold ${getHealthColor(health.score)}`}>
                                  {health.score}
                                </span>
                              </div>
                              <div>
                                <p className={`text-sm font-medium ${getHealthColor(health.score)}`}>
                                  {health.score >= 70 ? 'Healthy' : health.score >= 40 ? 'Needs Attention' : 'At Risk'}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                  {health.completedVisits} visits • Last: {health.lastVisit ? formatTimeAgo(health.lastVisit) : 'Never'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {prop.sub_status === 'ACTIVE' ? (
                            <div className="flex items-center gap-2 text-emerald-500 text-sm">
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
                              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                              {payingPropertyId === prop.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                          <ArrowRightIcon className={`h-5 w-5 transition-all duration-300 group-hover:translate-x-1 ${darkMode ? 'text-white/30 group-hover:text-white/60' : 'text-gray-300 group-hover:text-gray-500'
                            }`} />
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })
            ) : (
              <GlassCard className={`text-center py-20 px-6 !border-dashed ${darkMode ? '!border-white/10' : '!border-gray-300'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                  <HomeModernIcon className={`h-8 w-8 ${darkMode ? 'text-white/20' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  No properties yet
                </h3>
                <p className={`text-sm mb-6 max-w-xs mx-auto ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  Add your first property to start monitoring with our scouts.
                </p>
                <button
                  onClick={() => navigate('/add-property')}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg ${darkMode
                    ? 'bg-white text-slate-900 hover:bg-white/90'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Your First Property
                </button>
              </GlassCard>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <GlassCard className={`text-center py-16 px-6 ${darkMode ? '!border-white/10' : '!border-gray-200'}`}>
                <BellIcon className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-white/20' : 'text-gray-300'}`} />
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                  No activity yet
                </h3>
                <p className={`text-sm mt-2 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  Activity will appear here when scouts visit your properties.
                </p>
              </GlassCard>
            ) : (
              activities.map((activity, index) => (
                <GlassCard
                  key={activity.id || index}
                  className="p-4 cursor-pointer"
                  onClick={() => activity.property_id && navigate(`/property/${activity.property_id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${darkMode ? 'bg-white/10' : 'bg-gray-100'
                      }`}>
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {activity.title}
                      </p>
                      <p className={`text-sm mt-0.5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-blue-500 font-medium">{activity.property_name}</span>
                        <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>•</span>
                        <span className={`text-xs ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

      </main>

      {/* Approval Reminder Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <button
            className="absolute inset-0 cursor-default"
            onClick={() => setShowApprovalModal(false)}
          />
          <GlassCard className={`max-w-sm w-full relative overflow-hidden z-10 animate-scale-in !p-6 ${darkMode ? '!bg-slate-900/95' : '!bg-white/95'
            }`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />

            <div className="text-center mb-6 mt-2">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'
                }`}>
                <BellIcon className="h-8 w-8 text-purple-500 animate-bounce" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Action Required
              </h3>
              <p className={darkMode ? 'text-white/60' : 'text-gray-500'}>
                You have <span className="font-bold text-purple-500">{pendingCount}</span> {pendingCount === 1 ? 'visit' : 'visits'} waiting for your approval.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${darkMode
                  ? 'bg-white/5 text-white/60 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
              >
                Remind Me Later
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all"
              >
                Review Now
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;