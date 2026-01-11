import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingPropertyId, setPayingPropertyId] = useState(null); // Track which button is loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const res = await axios.get('https://sitesee-api.onrender.com/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
        setLoading(false);

        // Check for payment success
        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'success') {
            alert("Payment Successful! 🚀");
            window.history.replaceState({}, document.title, "/dashboard");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate, location]);

  // --- FIXED: Robust Payment Function ---
  const handleSubscribe = async (propertyId) => {
    if (!window.confirm("Start Monthly Subscription for GHS 50?")) return;
    
    setPayingPropertyId(propertyId); // Show loading only on the clicked button
    
    // 1. Safe Email Fallback
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
                is_visit: false // Explicitly say this is a SUBSCRIPTION
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Paystack Res:", res.data); // Debug Log

        // 2. Smart Redirect Logic
        // Check both possible locations for the URL
        const paystackUrl = res.data.authorization_url || res.data.data?.authorization_url;

        if (paystackUrl && paystackUrl.startsWith('http')) {
            window.location.href = paystackUrl;
        } else {
            console.error("Link missing:", res.data);
            alert("Error: Payment link not found from server.");
            setPayingPropertyId(null);
        }

    } catch (err) {
        console.error("Payment Error:", err);
        const errorMsg = err.response?.data?.error || "Failed to start payment";
        alert(errorMsg);
        setPayingPropertyId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/'); 
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {data.user.full_name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">Welcome back to SiteSee.</p>
        </div>
        <button onClick={handleLogout} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition">
          Logout
        </button>
      </div>

      {/* MY PROPERTIES GRID */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">My Properties</h2>
            <p className="text-sm text-gray-500">Each property requires an active subscription.</p>
          </div>
          <button 
            onClick={() => navigate('/add-property')} 
            className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition font-bold flex items-center gap-2"
          >
            <span>+</span> Add New Property
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.properties && data.properties.length > 0 ? (
            data.properties.map((prop) => (
              <div key={prop.id} className="border border-gray-200 p-5 rounded-xl hover:shadow-lg transition bg-white flex flex-col justify-between">
                
                {/* Property Details */}
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-xl text-gray-800">{prop.name}</h3>
                        {/* Status Badge */}
                        {prop.sub_status === 'ACTIVE' ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                Active Plan
                            </span>
                        ) : (
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                Inactive
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 mb-4">📍 {prop.address}</p>
                </div>

                {/* Actions Area */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  
                  {/* LEFT: View Reports Link */}
                  <button 
                    onClick={() => navigate(`/property/${prop.id}`)}
                    className="text-blue-600 font-semibold hover:underline text-sm"
                  >
                    View Reports & History
                  </button>

                  {/* RIGHT: The Activate Button */}
                  {prop.sub_status === 'ACTIVE' ? (
                      <div className="text-green-600 text-sm font-bold flex items-center gap-1">
                          ✅ Scout Ready
                      </div>
                  ) : (
                      <button 
                        onClick={(e) => {
                             e.stopPropagation();
                             handleSubscribe(prop.id);
                        }}
                        disabled={payingPropertyId === prop.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 transition flex items-center gap-2"
                      >
                        {payingPropertyId === prop.id ? 'Loading...' : 'Activate (GHS 50)'}
                      </button>
                  )}
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-2 bg-gray-50 p-10 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-lg">You have no properties yet.</p>
              <button onClick={() => navigate('/add-property')} className="mt-2 text-blue-600 font-bold hover:underline">
                Add your first property now
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
//fixxxx
export default Dashboard;