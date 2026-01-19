import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    UsersIcon,
    CurrencyDollarIcon,
    ClipboardDocumentCheckIcon,
    BuildingOfficeIcon,
    ArrowRightStartOnRectangleIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
    const { user, logout, authLoading } = useContext(AuthContext); // Destructure authLoading
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [visits, setVisits] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [resolveModal, setResolveModal] = useState({ open: false, dispute: null });
    const [resolution, setResolution] = useState('');
    const [resolving, setResolving] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 1. Redirect if not Admin (wait for auth to finish loading first)
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'ADMIN') {
                navigate('/dashboard');
            }
        }
    }, [user, authLoading, navigate]);

    // 2. Fetch Data (only if Admin and Auth Finished)
    useEffect(() => {
        if (authLoading) return; // Wait
        if (!user || user.role !== 'ADMIN') return; // Security check

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const config = { headers: { Authorization: `Bearer ${token}` } };

                const statsRes = await axios.get('https://sitesee-api.onrender.com/api/admin/stats', config);
                setStats(statsRes.data);

                const usersRes = await axios.get('https://sitesee-api.onrender.com/api/admin/users', config);
                setUsers(usersRes.data);

                const visitsRes = await axios.get('https://sitesee-api.onrender.com/api/admin/visits', config);
                setVisits(visitsRes.data);

                const disputesRes = await axios.get('https://sitesee-api.onrender.com/api/admin/disputes', config);
                setDisputes(disputesRes.data);
            } catch (err) {
                console.error("Admin Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (authLoading || loading) { // Show loader if Auth OR Data is loading
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-white/50">Loading Admin Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-white/5 hidden md:flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        <span className="text-blue-500">SiteSee</span> Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ChartBarIcon className="h-5 w-5" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <UsersIcon className="h-5 w-5" />
                        Users Management
                    </button>
                    <button
                        onClick={() => setActiveTab('visits')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'visits' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                        Visit Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('disputes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'disputes' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        Disputes
                        {disputes.filter(d => d.status === 'OPEN').length > 0 && (
                            <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                {disputes.filter(d => d.status === 'OPEN').length}
                            </span>
                        )}
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold tracking-tight text-white">
                    <span className="text-blue-500">SiteSee</span> Admin
                </h1>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                    <Bars3Icon className="h-6 w-6 text-white" />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 border-l border-white/5 flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Menu</h2>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                <XMarkIcon className="h-5 w-5 text-white" />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2">
                            <button
                                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <ChartBarIcon className="h-5 w-5" />
                                Overview
                            </button>
                            <button
                                onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <UsersIcon className="h-5 w-5" />
                                Users
                            </button>
                            <button
                                onClick={() => { setActiveTab('visits'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'visits' ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                Visits
                            </button>
                            <button
                                onClick={() => { setActiveTab('disputes'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'disputes' ? 'bg-red-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <ExclamationTriangleIcon className="h-5 w-5" />
                                Disputes
                                {disputes.filter(d => d.status === 'OPEN').length > 0 && (
                                    <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                        {disputes.filter(d => d.status === 'OPEN').length}
                                    </span>
                                )}
                            </button>
                        </nav>
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'visits' && 'All Visit Requests'}
                        {activeTab === 'disputes' && 'Dispute Management'}
                    </h2>
                    <div className="text-sm text-white/50">
                        Logged in as <span className="text-white font-medium">{user?.email}</span>
                    </div>
                </header>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Stat Card 1 */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <UsersIcon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/50">Total</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
                            <p className="text-sm text-white/40 mt-1">Registered Clients</p>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                                    <BuildingOfficeIcon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/50">Active</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalScouts}</p>
                            <p className="text-sm text-white/40 mt-1">Verified Scouts</p>
                        </div>

                        {/* Stat Card 3 */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <CurrencyDollarIcon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-white/50">Est.</span>
                            </div>
                            <p className="text-3xl font-bold text-white">GHS {stats.revenue}</p>
                            <p className="text-sm text-white/40 mt-1">Total Revenue</p>
                        </div>

                        {/* Stat Card 4 */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <ClipboardDocumentCheckIcon className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2 py-1 rounded">{stats.visits.pending} Pending</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.visits.total}</p>
                            <p className="text-sm text-white/40 mt-1">Total Valid Visits</p>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-white/40 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 font-medium text-white">{u.full_name}</td>
                                        <td className="px-6 py-4 text-white/70">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                                u.role === 'SCOUT' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/50">{u.phone_number || 'N/A'}</td>
                                        <td className="px-6 py-4 text-white/50 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* VISITS TAB */}
                {activeTab === 'visits' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-white/40 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Assigned Scout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {visits.map(v => (
                                    <tr key={v.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 text-white/70 font-mono text-sm">
                                            {new Date(v.scheduled_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${v.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                v.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                                }`}>
                                                {v.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{v.property_name}</div>
                                            <div className="text-white/40 text-xs truncate max-w-[150px]">{v.address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/70 text-sm">{v.client_name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {v.scout_name ? (
                                                <span className="text-amber-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                    {v.scout_name}
                                                </span>
                                            ) : (
                                                <span className="text-white/20 italic">Unassigned</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DISPUTES TAB */}
                {activeTab === 'disputes' && (
                    <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-white/40 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Reporter</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {disputes.map(d => (
                                    <tr key={d.id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 text-white/70 font-mono text-sm">
                                            {new Date(d.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${d.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                d.status === 'CLOSED' ? 'bg-white/10 text-white/50' :
                                                    d.status === 'IN_REVIEW' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{d.reporter_name}</div>
                                            <div className="text-white/40 text-xs">{d.reporter_role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{d.property_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white/60 text-sm max-w-[200px] truncate">
                                            {d.reason?.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {d.status === 'OPEN' && (
                                                <button
                                                    onClick={() => setResolveModal({ open: true, dispute: d })}
                                                    className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-all"
                                                >
                                                    Review
                                                </button>
                                            )}
                                            {d.status === 'IN_REVIEW' && (
                                                <button
                                                    onClick={() => setResolveModal({ open: true, dispute: d })}
                                                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                            {(d.status === 'RESOLVED' || d.status === 'CLOSED') && d.resolution && (
                                                <span className="text-white/40 text-xs italic truncate max-w-[150px] block">{d.resolution}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {disputes.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-white/40">
                                            No disputes yet. Great news! 🎉
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>

            {/* Resolve Modal */}
            {resolveModal.open && resolveModal.dispute && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => { setResolveModal({ open: false, dispute: null }); setResolution(''); }}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4">Dispute Details</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-white/50">Reporter:</span>
                                <span className="text-white">{resolveModal.dispute.reporter_name} ({resolveModal.dispute.reporter_role})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Property:</span>
                                <span className="text-white">{resolveModal.dispute.property_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Reason:</span>
                                <span className="text-white capitalize">{resolveModal.dispute.reason?.replace(/_/g, ' ')}</span>
                            </div>
                            <div>
                                <span className="text-white/50 block mb-1">Description:</span>
                                <p className="text-white bg-white/5 p-3 rounded-lg text-sm">{resolveModal.dispute.description}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white/70 mb-2">Resolution Notes</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="How was this resolved..."
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    setResolving(true);
                                    try {
                                        const token = localStorage.getItem('token');
                                        await axios.put(
                                            `https://sitesee-api.onrender.com/api/admin/disputes/${resolveModal.dispute.id}`,
                                            { status: 'RESOLVED', resolution },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        const res = await axios.get('https://sitesee-api.onrender.com/api/admin/disputes', { headers: { Authorization: `Bearer ${token}` } });
                                        setDisputes(res.data);
                                        setResolveModal({ open: false, dispute: null });
                                        setResolution('');
                                    } catch (err) {
                                        alert('Failed to resolve dispute');
                                    } finally {
                                        setResolving(false);
                                    }
                                }}
                                disabled={resolving}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all"
                            >
                                {resolving ? 'Resolving...' : 'Mark Resolved'}
                            </button>
                            <button
                                onClick={async () => {
                                    const token = localStorage.getItem('token');
                                    await axios.put(
                                        `https://sitesee-api.onrender.com/api/admin/disputes/${resolveModal.dispute.id}`,
                                        { status: 'IN_REVIEW' },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    const res = await axios.get('https://sitesee-api.onrender.com/api/admin/disputes', { headers: { Authorization: `Bearer ${token}` } });
                                    setDisputes(res.data);
                                    setResolveModal({ open: false, dispute: null });
                                }}
                                className="px-6 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-all"
                            >
                                Mark In Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
