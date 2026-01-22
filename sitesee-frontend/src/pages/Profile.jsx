import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import {
    ArrowLeftIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    TrophyIcon,
    HomeModernIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

// Magic UI Components
import GlassCard from '../components/magicui/GlassCard';
import AnimatedGradient from '../components/magicui/AnimatedGradient';
import BottomNav from '../components/BottomNav';

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { darkMode } = useContext(ThemeContext);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        bio: '',
        location: ''
    });

    const isOwnProfile = !id || id === user?.id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = id
                    ? `https://sitesee-api.onrender.com/api/profile/${id}`
                    : 'https://sitesee-api.onrender.com/api/profile';

                const res = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setProfile(res.data);
                setFormData({
                    full_name: res.data.full_name || '',
                    phone_number: res.data.phone_number || '',
                    bio: res.data.bio || '',
                    location: res.data.location || ''
                });
                setLoading(false);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                'https://sitesee-api.onrender.com/api/profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile(prev => ({ ...prev, ...res.data }));
            setEditing(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'SCOUT':
                return { bg: 'bg-amber-500/20', text: 'text-amber-500', label: '⚡ Scout' };
            case 'ADMIN':
                return { bg: 'bg-purple-500/20', text: 'text-purple-500', label: '👑 Admin' };
            default:
                return { bg: 'bg-blue-500/20', text: 'text-blue-500', label: '🏠 Client' };
        }
    };

    const inputClasses = `w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
        ? 'bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`;

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
                Profile not found
            </div>
        );
    }

    const roleBadge = getRoleBadge(profile.role);

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-50 text-gray-900'}`}>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {darkMode && (
                    <AnimatedGradient
                        colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                        speed={20}
                        blur="heavy"
                    />
                )}
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-40 backdrop-blur-2xl transition-colors duration-500 ${darkMode
                ? 'bg-slate-950/80 border-white/5'
                : 'bg-white/80 border-gray-200'
                } border-b`}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode
                                ? 'hover:bg-white/10 text-white/70'
                                : 'hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-semibold">Profile</h1>
                    </div>

                    {isOwnProfile && !editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${darkMode
                                ? 'bg-white/10 hover:bg-white/15 text-white/80'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </button>
                    )}
                </div>
            </header>

            <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 pb-28">

                {/* Profile Card */}
                <GlassCard className="p-8 mb-8 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20" />

                    <div className="relative z-10">
                        {/* Avatar & Name */}
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-blue-500/30">
                                {profile.profile_image ? (
                                    <img src={profile.profile_image} alt="" className="w-full h-full rounded-2xl object-cover" />
                                ) : (
                                    profile.full_name?.charAt(0)?.toUpperCase() || '?'
                                )}
                            </div>

                            <div className="flex-1">
                                {editing ? (
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                        className={`${inputClasses} text-xl font-bold !py-2`}
                                        placeholder="Your name"
                                    />
                                ) : (
                                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {profile.full_name || 'Unnamed User'}
                                    </h2>
                                )}

                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                                        {roleBadge.label}
                                    </span>
                                    <span className={`text-sm ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                                        Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-6">
                            {editing ? (
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                    className={`${inputClasses} resize-none`}
                                    rows={3}
                                    placeholder="Tell others about yourself..."
                                />
                            ) : (
                                <p className={`leading-relaxed ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>
                                    {profile.bio || (isOwnProfile ? 'Add a bio to tell others about yourself' : 'No bio yet')}
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {isOwnProfile && (
                                <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${darkMode ? 'bg-white/5' : 'bg-gray-100'
                                    }`}>
                                    <EnvelopeIcon className={`h-5 w-5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                                        {profile.email}
                                    </span>
                                </div>
                            )}

                            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${darkMode ? 'bg-white/5' : 'bg-gray-100'
                                }`}>
                                {editing ? (
                                    <>
                                        <PhoneIcon className={`h-5 w-5 shrink-0 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                                        <input
                                            type="tel"
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                                            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                                            placeholder="Phone number"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <PhoneIcon className={`h-5 w-5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                                        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                                            {profile.phone_number || 'No phone'}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${darkMode ? 'bg-white/5' : 'bg-gray-100'
                                }`}>
                                {editing ? (
                                    <>
                                        <MapPinIcon className={`h-5 w-5 shrink-0 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                                            placeholder="Location (e.g., Accra, Ghana)"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MapPinIcon className={`h-5 w-5 ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                                        <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                                            {profile.location || 'No location'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Save/Cancel buttons */}
                        {editing && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <CheckIcon className="h-5 w-5" />
                                    )}
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className={`px-6 py-3.5 rounded-xl font-semibold transition-all ${darkMode
                                        ? 'bg-white/10 hover:bg-white/15 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Stats Section */}
                {profile.stats && (
                    <div className="mb-8">
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <BriefcaseIcon className={`h-5 w-5 ${darkMode ? 'text-white/50' : 'text-gray-500'}`} />
                            Statistics
                        </h3>

                        {profile.role === 'SCOUT' ? (
                            <div className="grid grid-cols-3 gap-3">
                                <GlassCard className="p-5 text-center">
                                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {profile.stats.jobs_completed || 0}
                                    </p>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                        Jobs Done
                                    </p>
                                </GlassCard>
                                <GlassCard className="p-5 text-center !bg-gradient-to-br !from-amber-500/20 !to-amber-600/10 !border-amber-500/20">
                                    <div className="flex items-center justify-center gap-1">
                                        <StarSolid className="h-5 w-5 text-amber-400" />
                                        <span className="text-3xl font-bold text-amber-500">
                                            {parseFloat(profile.stats.avg_rating || 0).toFixed(1)}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                        Rating
                                    </p>
                                </GlassCard>
                                <GlassCard className="p-5 text-center">
                                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {profile.stats.badges_earned || 0}
                                    </p>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                        Badges
                                    </p>
                                </GlassCard>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <GlassCard className="p-5 text-center">
                                    <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {profile.stats.total_properties || 0}
                                    </p>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                        Properties
                                    </p>
                                </GlassCard>
                                <GlassCard className="p-5 text-center !bg-gradient-to-br !from-blue-500/20 !to-cyan-500/10 !border-blue-500/20">
                                    <p className="text-3xl font-bold text-blue-500">
                                        {profile.stats.active_subscriptions || 0}
                                    </p>
                                    <p className={`text-xs mt-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
                                        Active Plans
                                    </p>
                                </GlassCard>
                            </div>
                        )}
                    </div>
                )}

                {/* Achievements (Scouts only) */}
                {profile.role === 'SCOUT' && profile.achievements?.length > 0 && (
                    <div className="mb-8">
                        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            <TrophyIcon className="h-5 w-5 text-amber-400" />
                            Achievements
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.achievements.map((ach, i) => (
                                <GlassCard
                                    key={i}
                                    className="px-4 py-2 flex items-center gap-2"
                                    hover={false}
                                    title={ach.description}
                                >
                                    <span className="text-xl">{ach.icon}</span>
                                    <span className={`text-sm font-medium ${darkMode ? 'text-white/70' : 'text-gray-700'}`}>
                                        {ach.name}
                                    </span>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Profile;
