import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Image Modal State
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // FIX: Changed '/login' to '/' (Your login is on the home page)
        if (!token) return navigate('/');

        const res = await axios.get('https://sitesee-api.onrender.com/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        // If error (e.g., token expired), logout user
        handleLogout();
      }
    };
    fetchData();
  }, [navigate]);

  // 2. Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Destroy the key
    // FIX: Changed '/login' to '/'
    navigate('/'); 
  };

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* HEADER Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello, {data.user.first_name || 'User'}! 👋
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

      {/* STATUS CARD Section */}
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
          <div className="flex items-center justify-between">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
              PENDING / INACTIVE
            </span>
            {/* Show Pay Button only if inactive */}
            {/* NOTE: Ensure you have a /subscribe route or change this to your payment link */}
            <button 
                onClick={() => navigate('/subscribe')} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Activate Now
            </button>
          </div>
        )}
      </div>

      {/* GALLERY Section (Scout Reports) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Scout Pictures</h2>
        
        {/* Placeholder if no reports yet */}
        {data.reports.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-lg">
            <p>No pictures yet.</p>
            <p className="text-sm">Once a scout visits, pictures will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* This maps through images. Since we don't have real images yet, 
                 I'll add a dummy image so you can test the viewer. */}
             
             {/* DUMMY IMAGE FOR TESTING */}
             <div 
               className="cursor-pointer group relative overflow-hidden rounded-lg"
               onClick={() => setSelectedImage('https://via.placeholder.com/800')}
             >
               <img 
                 src="https://via.placeholder.com/300" 
                 alt="Property View" 
                 className="w-full h-48 object-cover group-hover:scale-105 transition"
               />
               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
             </div>
             
          </div>
        )}
      </div>

      {/* LIGHTBOX / MODAL (Pop-up when clicking an image) */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"
            >
              &times;
            </button>

            {/* Big Image */}
            <img 
              src={selectedImage} 
              alt="Full Size" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-md"
            />

            {/* Download Button */}
            <div className="mt-4 text-center">
              <a 
                href={selectedImage} 
                download="scout_image.jpg"
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition"
              >
                Download HD Image ⬇️
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
//dash  
export default Dashboard;