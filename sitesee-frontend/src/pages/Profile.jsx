import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    ArrowLeftIcon,
    UserCircleIcon,
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon,
    StarIcon,
    TrophyIcon,
    HomeModernIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const Profile = () => {
    const { id } = useParams(); // Optional: view someone else's profile
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Edit form state
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
                return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '⚡ Scout' };
            case 'ADMIN':
                return { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '👑 Admin' };
            default:
                return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '🏠 Client' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Profile not found
            </div>
        );
    }

    const roleBadge = getRoleBadge(profile.role);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">

            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </button>
                        <h1 className="text-lg font-semibold">Profile</h1>
                    </div>

                    {isOwnProfile && !editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-full text-sm font-medium transition-all"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8">

                {/* Profile Card */}
                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 mb-8 relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="relative z-10">
                        {/* Avatar & Name */}
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl font-bold text-white shrink-0">
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
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none focus:border-blue-500"
                                        placeholder="Your name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-white">{profile.full_name || 'Unnamed User'}</h2>
                                )}

                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                                        {roleBadge.label}
                                    </span>
                                    <span className="text-white/30 text-sm">
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
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Tell others about yourself..."
                                />
                            ) : (
                                <p className="text-white/60 leading-relaxed">
                                    {profile.bio || (isOwnProfile ? 'Add a bio to tell others about yourself' : 'No bio yet')}
                                </p>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {isOwnProfile && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                                    <EnvelopeIcon className="h-5 w-5 text-white/40" />
                                    <span className="text-sm text-white/70">{profile.email}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                                {editing ? (
                                    <>
                                        <PhoneIcon className="h-5 w-5 text-white/40" />
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
                                        <PhoneIcon className="h-5 w-5 text-white/40" />
                                        <span className="text-sm text-white/70">{profile.phone_number || 'No phone'}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                                {editing ? (
                                    <>
                                        <MapPinIcon className="h-5 w-5 text-white/40" />
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
                                        <MapPinIcon className="h-5 w-5 text-white/40" />
                                        <span className="text-sm text-white/70">{profile.location || 'No location'}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Save/Cancel buttons when editing */}
                        {editing && (
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <CheckIcon className="h-5 w-5" />
                                    )}
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Section */}
                {profile.stats && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <BriefcaseIcon className="h-5 w-5 text-white/50" />
                            Statistics
                        </h3>

                        {profile.role === 'SCOUT' ? (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5">
                                    <p className="text-3xl font-bold text-white">{profile.stats.jobs_completed || 0}</p>
                                    <p className="text-xs text-white/40 mt-1">Jobs Done</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl p-5 text-center border border-amber-500/20">
                                    <div className="flex items-center justify-center gap-1">
                                        <StarSolid className="h-5 w-5 text-amber-400" />
                                        <span className="text-3xl font-bold text-amber-400">
                                            {parseFloat(profile.stats.avg_rating || 0).toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 mt-1">Rating</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5">
                                    <p className="text-3xl font-bold text-white">{profile.stats.badges_earned || 0}</p>
                                    <p className="text-xs text-white/40 mt-1">Badges</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/5">
                                    <p className="text-3xl font-bold text-white">{profile.stats.total_properties || 0}</p>
                                    <p className="text-xs text-white/40 mt-1">Properties</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-5 text-center border border-blue-500/20">
                                    <p className="text-3xl font-bold text-blue-400">{profile.stats.active_subscriptions || 0}</p>
                                    <p className="text-xs text-white/40 mt-1">Active Plans</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Achievements (Scouts only) */}
                {profile.role === 'SCOUT' && profile.achievements?.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrophyIcon className="h-5 w-5 text-amber-400" />
                            Achievements
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.achievements.map((ach, i) => (
                                <div
                                    key={i}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2"
                                    title={ach.description}
                                >
                                    <span className="text-xl">{ach.icon}</span>
                                    <span className="text-sm font-medium text-white/70">{ach.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

export default Profile;
