import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
} from '@heroicons/react/24/solid';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);
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

    // Appearance State
    const [darkMode, setDarkMode] = useState(true);

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

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // In a real app, you'd persist this to localStorage/database
        localStorage.setItem('darkMode', !darkMode);
    };

    // Determine if user is a scout
    const isScout = user?.role === 'SCOUT';

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-xl ${darkMode ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-gray-200'} border-b`}>
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                {/* Profile Section */}
                <section className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <UserCircleIcon className="h-5 w-5 text-blue-500" />
                            Profile
                        </h2>
                        {!editingProfile ? (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className={`text-sm px-3 py-1.5 rounded-lg ${darkMode ? 'bg-white/10 hover:bg-white/15' : 'bg-gray-100 hover:bg-gray-200'} transition-colors flex items-center gap-1`}
                            >
                                <PencilIcon className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingProfile(false)}
                                    className="text-sm px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1"
                                >
                                    <CheckIcon className="h-3.5 w-3.5" />
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'} mb-1`}>Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                disabled={!editingProfile}
                                className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/5 border-white/10 disabled:text-white/70' : 'bg-gray-50 border-gray-200 disabled:text-gray-600'} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'} mb-1 flex items-center gap-2`}>
                                <EnvelopeIcon className="h-4 w-4" /> Email
                            </label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-100 border-gray-200 text-gray-500'} border cursor-not-allowed`}
                            />
                            <p className={`text-xs mt-1 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>Email cannot be changed</p>
                        </div>

                        <div>
                            <label className={`block text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'} mb-1 flex items-center gap-2`}>
                                <PhoneIcon className="h-4 w-4" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                value={profile.phone_number}
                                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                disabled={!editingProfile}
                                placeholder="e.g. 0241234567"
                                className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/5 border-white/10 disabled:text-white/70 placeholder:text-white/20' : 'bg-gray-50 border-gray-200 disabled:text-gray-600 placeholder:text-gray-400'} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'} mb-1 flex items-center gap-2`}>
                                <MapPinIcon className="h-4 w-4" /> Address
                            </label>
                            <input
                                type="text"
                                value={profile.address}
                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                disabled={!editingProfile}
                                placeholder="Your location"
                                className={`w-full px-4 py-3 rounded-xl ${darkMode ? 'bg-white/5 border-white/10 disabled:text-white/70 placeholder:text-white/20' : 'bg-gray-50 border-gray-200 disabled:text-gray-600 placeholder:text-gray-400'} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        {darkMode ? <MoonIcon className="h-5 w-5 text-purple-400" /> : <SunIcon className="h-5 w-5 text-amber-400" />}
                        Appearance
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Toggle between light and dark themes</p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span
                                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${darkMode ? 'left-7' : 'left-1'}`}
                            />
                        </button>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <BellIcon className="h-5 w-5 text-amber-400" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        {[
                            { key: 'email_updates', label: 'Email Updates', desc: 'Receive updates via email' },
                            { key: 'sms_alerts', label: 'SMS Alerts', desc: 'Get text message notifications' },
                            { key: 'job_reminders', label: isScout ? 'Job Reminders' : 'Visit Reminders', desc: isScout ? 'Reminders for claimed jobs' : 'Reminders for scheduled visits' },
                            { key: 'payment_alerts', label: 'Payment Alerts', desc: isScout ? 'Earnings and payout updates' : 'Subscription and payment updates' }
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${notifications[item.key] ? 'bg-blue-600' : darkMode ? 'bg-white/20' : 'bg-gray-300'}`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${notifications[item.key] ? 'left-6' : 'left-1'}`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Security Section */}
                <section className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                        <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                        Security & Privacy
                    </h2>

                    <div className="space-y-3">
                        <button className={`w-full text-left px-4 py-3 rounded-xl ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                            <p className="font-medium">Change Password</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Update your account password</p>
                        </button>

                        <button className={`w-full text-left px-4 py-3 rounded-xl ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                            <p className="font-medium">Privacy Settings</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Control your data sharing preferences</p>
                        </button>

                        <button className={`w-full text-left px-4 py-3 rounded-xl ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                            <p className="font-medium">Download My Data</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Export all your data</p>
                        </button>
                    </div>
                </section>

                {/* Scout-specific Settings */}
                {isScout && (
                    <section className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <CameraIcon className="h-5 w-5 text-amber-400" />
                            Scout Preferences
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto-watermark Photos</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Add verification info to photos</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Always On</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">GPS Tracking</p>
                                    <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Required for photo verification</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Required</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Danger Zone */}
                <section className={`rounded-2xl p-6 border ${darkMode ? 'border-red-500/30 bg-red-500/5' : 'border-red-200 bg-red-50'}`}>
                    <h2 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h2>

                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to sign out?')) {
                                logout();
                                navigate('/');
                            }
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                        Sign Out
                    </button>
                </section>

                {/* Version Info */}
                <div className={`text-center py-8 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    <p className="text-sm">SiteSee {isScout ? 'Scout' : 'Client'} App</p>
                    <p className="text-xs mt-1">Version 1.0.0</p>
                </div>
            </main>
        </div>
    );
};

export default Settings;
