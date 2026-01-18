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
    ChartBarIcon
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [visits, setVisits] = useState([]);
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, visits
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple security check on mount (in addition to backend protection)
        if (user && user.role !== 'ADMIN') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const statsRes = await axios.get('https://sitesee-api.onrender.com/api/admin/stats', config);
                setStats(statsRes.data);

                const usersRes = await axios.get('https://sitesee-api.onrender.com/api/admin/users', config);
                setUsers(usersRes.data);

                const visitsRes = await axios.get('https://sitesee-api.onrender.com/api/admin/visits', config);
                setVisits(visitsRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Admin Fetch Error:", err);
                setLoading(false);
            }
        };

        if (user && user.role === 'ADMIN') {
            fetchData();
        }
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
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

            {/* Mobile Header (Visible on small screens) */}
            {/* ... skipping for brevity, can add if needed ... */}

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'users' && 'User Management'}
                        {activeTab === 'visits' && 'All Visit Requests'}
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

            </main>
        </div>
    );
};

export default AdminDashboard;
