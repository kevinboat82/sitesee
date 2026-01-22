import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../api';
import {
    UserCircleIcon,
    SunIcon,
    MoonIcon,
    BellIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    CheckIcon,
    PencilIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CameraIcon
} from '@heroicons/react/24/outline';

// Magic UI Components
import GlassCard from '../components/magicui/GlassCard';
import AnimatedGradient from '../components/magicui/AnimatedGradient';
import BottomNav from '../components/BottomNav';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);
    const { darkMode, toggleDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    // Profile State
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: ''
    });
    const [saving, setSaving] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);

    // Notification Settings
    const [notifications, setNotifications] = useState({
        email_updates: true,
        sms_alerts: false,
        job_reminders: true,
        payment_alerts: true
    });

    // Load user profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get('/auth/user');
                setProfile({
                    full_name: res.data.full_name || '',
                    email: res.data.email || '',
                    phone_number: res.data.phone_number || '',
                    address: res.data.address || ''
                });
            } catch (err) {
                console.error('Error loading profile:', err);
            }
        };
        loadProfile();
    }, []);

    // Save profile
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', profile);
            setEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Error saving profile');
        } finally {
            setSaving(false);
        }
    };

    const isScout = user?.role === 'SCOUT';

    const inputClasses = `w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
        ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:text-white/50'
        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:text-gray-500 disabled:bg-gray-100'
        }`;

    const labelClasses = `block text-sm mb-2 ${darkMode ? 'text-white/50' : 'text-gray-500'}`;

    // Toggle Switch Component
    const ToggleSwitch = ({ enabled, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative w-12 h-7 rounded-full transition-all duration-300 ${enabled
                ? 'bg-blue-500'
                : darkMode ? 'bg-white/20' : 'bg-gray-300'
                }`}
        >
            <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${enabled ? 'left-6' : 'left-1'
                    }`}
            />
        </button>
    );

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
            <header className={`sticky top-0 z-50 backdrop-blur-2xl transition-colors duration-500 ${darkMode
                ? 'bg-slate-950/80 border-white/5'
                : 'bg-white/80 border-gray-200'
                } border-b`}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode
                            ? 'hover:bg-white/10 text-white/70'
                            : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>
            </header>

            <main className="relative z-10 max-w-2xl mx-auto px-6 py-8 pb-28 space-y-6">

                {/* Profile Section */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <UserCircleIcon className="h-5 w-5 text-blue-500" />
                            Profile
                        </h2>
                        {!editingProfile ? (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className={`text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 ${darkMode
                                    ? 'bg-white/10 hover:bg-white/15 text-white/80'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                <PencilIcon className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingProfile(false)}
                                    className="text-sm px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                    <CheckIcon className="h-3.5 w-3.5" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                disabled={!editingProfile}
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={`${labelClasses} flex items-center gap-2`}>
                                <EnvelopeIcon className="h-4 w-4" /> Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className={`${inputClasses} cursor-not-allowed opacity-60`}
                            />
                            <p className={`text-xs mt-1.5 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                                Email cannot be changed
                            </p>
                        </div>

                        <div>
                            <label className={`${labelClasses} flex items-center gap-2`}>
                                <PhoneIcon className="h-4 w-4" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profile.phone_number}
                                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                disabled={!editingProfile}
                                placeholder="e.g. 0241234567"
                                className={inputClasses}
                            />
                        </div>

                        <div>
                            <label className={`${labelClasses} flex items-center gap-2`}>
                                <MapPinIcon className="h-4 w-4" /> Address
                            </label>
                            <input
                                type="text"
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                disabled={!editingProfile}
                                placeholder="Your location"
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Appearance Section */}
                <GlassCard className="p-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        {darkMode ? <MoonIcon className="h-5 w-5 text-purple-400" /> : <SunIcon className="h-5 w-5 text-amber-400" />}
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                Toggle between light and dark themes
                            </p>
                        </div>
                        <ToggleSwitch enabled={darkMode} onToggle={toggleDarkMode} />
                    </div>
                </GlassCard>

                {/* Notifications Section */}
                <GlassCard className="p-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <BellIcon className="h-5 w-5 text-amber-400" />
                        Notifications
                    </h2>

                    <div className="space-y-5">
                        {[
                            { key: 'email_updates', label: 'Email Updates', desc: 'Receive updates via email' },
                            { key: 'sms_alerts', label: 'SMS Alerts', desc: 'Get text message notifications' },
                            { key: 'job_reminders', label: isScout ? 'Job Reminders' : 'Visit Reminders', desc: isScout ? 'Reminders for claimed jobs' : 'Reminders for scheduled visits' },
                            { key: 'payment_alerts', label: 'Payment Alerts', desc: isScout ? 'Earnings and payout updates' : 'Subscription and payment updates' }
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                        {item.desc}
                                    </p>
                                </div>
                                <ToggleSwitch
                                    enabled={notifications[item.key]}
                                    onToggle={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                />
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Security Section */}
                <GlassCard className="p-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                        Security & Privacy
                    </h2>

                    <div className="space-y-2">
                        {[
                            { label: 'Change Password', desc: 'Update your account password' },
                            { label: 'Privacy Settings', desc: 'Control your data sharing preferences' },
                            { label: 'Download My Data', desc: 'Export all your data' }
                        ].map((item, idx) => (
                            <button
                                key={idx}
                                className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 ${darkMode
                                    ? 'hover:bg-white/5'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <p className="font-medium">{item.label}</p>
                                <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                    {item.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Scout Preferences */}
                {isScout && (
                    <GlassCard className="p-6">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <CameraIcon className="h-5 w-5 text-amber-400" />
                            Scout Preferences
                        </h2>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto-watermark Photos</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                        Add verification info to photos
                                    </p>
                                </div>
                                <span className="px-3 py-1.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                                    Always On
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">GPS Tracking</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                                        Required for photo verification
                                    </p>
                                </div>
                                <span className="px-3 py-1.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                                    Required
                                </span>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Danger Zone */}
                <GlassCard className={`p-6 !border-red-500/30 ${darkMode ? '!bg-red-500/5' : '!bg-red-50'}`}>
                    <h2 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h2>

                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to sign out?')) {
                                logout();
                                navigate('/');
                            }
                        }}
                        className={`w-full px-4 py-3.5 rounded-xl border font-medium transition-all duration-300 ${darkMode
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'border-red-300 text-red-600 hover:bg-red-100'
                            }`}
                    >
                        Sign Out
                    </button>
                </GlassCard>

                {/* Version Info */}
                <div className={`text-center py-8 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    <p className="text-sm">SiteSee {isScout ? 'Scout' : 'Client'} App</p>
                    <p className="text-xs mt-1">Version 1.0.0</p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Settings;
