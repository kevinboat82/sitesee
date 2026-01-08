import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PropertyDetails = () => {
  const { id } = useParams(); // Get the ID from the URL (e.g. /property/123)
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [visits, setVisits] = useState([]); // This will hold the reports/photos
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Get Property Info (Name, Address)
        const propRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}`, config);
        setProperty(propRes.data);

        // 2. Get Visits/Reports (Photos)
        const visitRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/visits`, config);
        setVisits(visitRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching property:", err);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Project Details...</div>;
  if (!property) return <div className="p-10 text-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 text-gray-500 hover:text-blue-900 font-bold flex items-center gap-2"
      >
        &larr; Back to Dashboard
      </button>

      {/* HEADER: Property Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.name}</h1>
                <p className="text-gray-600 flex items-center gap-2">
                    📍 {property.address}
                </p>
            </div>
            {/* Status Badge */}
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                Active Monitoring
            </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
             {property.google_maps_link && (
                 <a 
                   href={property.google_maps_link} 
                   target="_blank" 
                   rel="noreferrer"
                   className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-bold"
                 >
                    🗺️ Open in Google Maps
                 </a>
             )}
             <button className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-bold">
                📅 Request New Visit
             </button>
        </div>
      </div>

      {/* REPORTS SECTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Visit History & Photos</h2>

        {visits.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-2">No visits have been completed yet.</p>
                <p className="text-sm text-gray-400">Your scout will upload photos here after their first trip.</p>
            </div>
        ) : (
            <div className="space-y-8">
                {/* We will map through visits here later */}
                {visits.map((visit, index) => (
                    <div key={index} className="border-b pb-6">
                        <p className="font-bold text-gray-700 mb-2">
                            Visit on {new Date(visit.scheduled_date).toDateString()}
                        </p>
                        {visit.photo_url ? (
                            <img src={visit.photo_url} alt="Site update" className="w-48 h-32 object-cover rounded-lg" />
                        ) : (
                            <span className="text-xs text-gray-400">No photos for this visit.</span>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default PropertyDetails;