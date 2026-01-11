import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const PropertyDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get logged in user data
  
  const [property, setProperty] = useState(null);
  const [visits, setVisits] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const propRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}`, config);
        setProperty(propRes.data);

        const visitRes = await axios.get(`https://sitesee-api.onrender.com/api/properties/${id}/visits`, config);
        setVisits(visitRes.data);

        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

 const handleRequestVisit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);

    try {
      const token = localStorage.getItem('token');
      const VISIT_PRICE = 50.00;

      const res = await axios.post(
        'https://sitesee-api.onrender.com/api/payments/initialize', 
        { 
          email: user?.email, // ✅ Use Real User Email
          amount: VISIT_PRICE, 
          property_id: id,
          is_visit: true, // ✅ Tell Backend this is a Visit
          scheduled_date: visitDate,
          instructions: instructions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // ✅ Fix: Use authorization_url (not checkout_url)
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url;
      } else {
        alert("Payment Error: No URL returned");
        setRequestLoading(false);
      }

    } catch (err) {
      alert("Failed to initialize payment.");
      console.error(err);
      setRequestLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!property) return <div className="p-10 text-center">Property not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      
      <button 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 text-gray-500 hover:text-blue-900 font-bold flex items-center gap-2"
      >
        &larr; Back to Dashboard
      </button>

      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{property.name}</h1>
                <p className="text-gray-600">📍 {property.address}</p>
            </div>
           {/* Status Badge */}
           {property.sub_status === 'ACTIVE' ? (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    Active Monitoring
                </span>
            ) : (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                    Inactive Plan
                </span>
            )}
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
             
             {property.sub_status === 'ACTIVE' ? (
                 <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm font-bold shadow-md"
                 >
                    📅 Request New Visit
                 </button>
             ) : (
                 <div className="flex items-center gap-2">
                    <button 
                        disabled
                        className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed"
                    >
                        🔒 Request Locked
                    </button>
                    <p className="text-xs text-red-500 font-bold">
                        (Activate subscription first)
                    </p>
                 </div>
             )}
        </div>
      </div>

      {/* VISITS LIST */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Visit History</h2>
        {visits.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-2">No visits yet.</p>
                <p className="text-sm text-gray-400">Request a visit above to get started.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {visits.map((visit, index) => (
                    <div key={index} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-700">
                                {new Date(visit.scheduled_date).toDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                                Status: <span className="font-bold">{visit.status || 'PENDING'}</span>
                            </p>
                            {visit.instructions && <p className="text-xs text-gray-400 mt-1">Note: "{visit.instructions}"</p>}
                        </div>
                        {visit.photo_url && (
                             <a href={visit.photo_url} target="_blank" rel="noreferrer">
                                <img src={visit.photo_url} alt="Site" className="w-16 h-16 object-cover rounded border hover:opacity-80 transition" />
                             </a>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Schedule a Scout</h2>
                <form onSubmit={handleRequestVisit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-bold mb-1">When should we go?</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border p-2 rounded"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Special Instructions</label>
                        <textarea 
                            className="w-full border p-2 rounded"
                            rows="3"
                            placeholder="e.g. Please check the north boundary wall..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="w-1/2 bg-gray-200 text-gray-800 py-2 rounded font-bold"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={requestLoading}
                            className="w-1/2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700"
                        >
                            {requestLoading ? 'Processing...' : 'Pay GHS 50.00 & Schedule'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetails;