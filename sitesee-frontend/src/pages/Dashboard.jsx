import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To check for payment success in URL
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false); // New state for button loading
  
  // Image Modal State
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. Fetch Data on Load
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

        // Check for payment success message in URL (?payment=success)
        const params = new URLSearchParams(location.search);
        if (params.get('payment') === 'success') {
            alert("Payment Successful! Your subscription is active. 🚀");
            // Clear the URL so the alert doesn't show again on refresh
            window.history.replaceState({}, document.title, "/dashboard");
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate, location]);

  // 2. Handle Subscription Payment
  const handleSubscribe = async () => {
    // Safety Check: Do they have a property?
    if (!data.properties || data.properties.length === 0) {
        alert("Please add a property first so we know what to scout!");
        navigate('/add-property');
        return;
    }

    setPaymentLoading(true);
    try {
        const token = localStorage.getItem('token');
        
        // We will subscribe for the FIRST property in the list for now
        // In the future, you can make a dropdown to select which property
        const propertyToSubscribe = data.properties[0];

        const res = await axios.post(
            'https://sitesee-api.onrender.com/api/payments/initialize',
            {
                email: data.user.email,
                amount: 50.00, // Price in GHS
                property_id: propertyToSubscribe.id
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Redirect user to Paystack
        window.location.href = res.data.checkout_url;

    } catch (err) {
        console.error("Payment Error:", err);
        alert("Failed to start payment. Please try again.");
        setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/'); 
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* HEADER Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {data.user.full_name || 'User'}! 👋
          </h1>
          <p className="text-gray-600">Welcome back to SiteSee.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
        >
          Logout
        </button>
      </div>

      {/* MY PROPERTIES Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">My Properties</h2>
            <p className="text-sm text-gray-500">Manage the sites you want us to scout.</p>
          </div>
          <button 
            onClick={() => navigate('/add-property')} 
            className="bg-blue-900 text-white px-5 py-2 rounded-lg hover:bg-blue-800 transition font-bold flex items-center gap-2"
          >
            <span>+</span> Add New Property
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.properties && data.properties.length > 0 ? (
            data.properties.map((prop) => (
              <div key={prop.id} className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition bg-gray-50">
                <h3 className="font-bold text-gray-800">{prop.name}</h3>
                <p className="text-sm text-gray-600 mb-2">📍 {prop.address}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                     Active
                  </span>
                  <button 
                    onClick={() => navigate(`/property/${prop.id}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Reports &rarr;
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
              <p className="text-gray-500">You have no active properties.</p>
              <p className="text-sm text-gray-400">Add one to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* SUBSCRIPTION STATUS Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Subscription Status</h2>
        
        {data.subscription.status === 'ACTIVE' ? (
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              ACTIVE PLAN
            </span>
            <p className="text-sm text-gray-500">Your scout is scheduled for visits.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                PENDING / INACTIVE
                </span>
                <p className="text-sm text-gray-500 mt-1">Activate to start receiving scout visits.</p>
            </div>
            
            {/* ACTIVATE BUTTON */}
            <button 
                onClick={handleSubscribe} 
                disabled={paymentLoading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-lg transform transition hover:scale-105"
            >
              {paymentLoading ? 'Loading Paystack...' : 'Activate for GHS 50.00'}
            </button>
          </div>
        )}
      </div>

      {/* GALLERY Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Scout Pictures</h2>
        
        {data.reports.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
            <p>No pictures yet.</p>
            <p className="text-sm">Once a scout visits, pictures will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Add map logic for reports here later if needed */}
             <div className="text-gray-500">No images to display yet.</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;