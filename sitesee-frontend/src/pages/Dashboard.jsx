import { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { MapPinIcon, PhoneIcon, HomeModernIcon, CameraIcon, CreditCardIcon, PlusIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import Spinner from "../components/Spinner";

const Dashboard = () => {
  const { token, logout, user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProp, setNewProp] = useState({ name: "", gps_location: "", description: "", caretaker_phone: "" });
  
  // Modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [visits, setVisits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. Fetch Properties on Load
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get("/properties", {
          headers: { "x-auth-token": token },
        });
        setProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [token]);

  // 2. Handle Add Property
  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/properties", newProp, {
        headers: { "x-auth-token": token },
      });
      setProperties([...properties, res.data]);
      setNewProp({ name: "", gps_location: "", description: "", caretaker_phone: "" });
      alert("Property Added!");
    } catch (err) {
      alert("Error adding property");
    }
  };

  // 3. Handle Payment
  const handleSubscribe = async (propertyId) => {
    try {
      const res = await api.post("/payments/initialize", 
        { email: user.email, amount: 500, property_id: propertyId }, 
        { headers: { "x-auth-token": token } }
      );
      window.location.href = res.data.checkout_url;
    } catch (err) {
      alert("Payment Failed");
    }
  };

  // 4. View Photos
  const handleViewPhotos = async (property) => {
    setSelectedProperty(property);
    setShowModal(true);
    setModalLoading(true);
    try {
      const res = await api.get(`/properties/${property.id}/visits`, {
        headers: { "x-auth-token": token },
      });
      setVisits(res.data);
    } catch (err) {
      alert("Could not load photos");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    // MAIN BACKGROUND: "Architectural Morning" (Soft Blue/Grey/White)
    <div className="min-h-screen font-sans text-slate-800 bg-linear-to-br from-slate-100 via-blue-50 to-indigo-100 bg-fixed selection:bg-blue-200">
      
      {/* --- Glass Navbar --- */}
      <nav className="sticky top-4 z-20 mx-4 sm:mx-8 lg:mx-auto max-w-7xl">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/50 rounded-2xl px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-tr from-slate-700 to-slate-900 text-white p-2 rounded-xl shadow-md">
              <HomeModernIcon className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800">
              SiteSee
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block bg-white/40 px-3 py-1 rounded-full border border-white/60">
              Hello, {user?.full_name?.split(' ')[0]}
            </span>
            <button 
              onClick={logout} 
              className="text-slate-500 hover:text-red-500 transition hover:bg-white/80 p-2 rounded-full"
              title="Logout"
            >
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Property List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center text-slate-800">
              <h2 className="text-3xl font-bold tracking-tight">My Projects</h2>
              <span className="bg-white/40 backdrop-blur-md border border-white/60 text-slate-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {properties.length} Active
              </span>
            </div>

            {loading ? <div className="bg-white/40 backdrop-blur-md rounded-3xl p-10"><Spinner /></div> : properties.length === 0 ? (
              <div className="bg-white/50 backdrop-blur-xl p-12 rounded-3xl shadow-sm border border-white/60 text-center">
                <HomeModernIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Your portfolio is empty.</p>
                <p className="text-slate-500 text-sm">Add your first property to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {properties.map((prop) => (
                  // GLASS CARD
                  <div key={prop.id} className="group bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">{prop.name}</h3>
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{prop.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                            <MapPinIcon className="h-4 w-4 text-indigo-500" />
                            {prop.gps_location}
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                            <PhoneIcon className="h-4 w-4 text-emerald-600" />
                            {prop.caretaker_phone}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className="bg-emerald-100/80 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold border border-emerald-200">
                        Active
                      </span>
                    </div>

                    <div className="border-t border-slate-200/60 mt-6 pt-4 flex flex-col sm:flex-row gap-3">
                       <button 
                          onClick={() => handleSubscribe(prop.id)}
                          className="flex-1 flex justify-center items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                        >
                          <CreditCardIcon className="h-5 w-5" />
                          Subscribe (500 GHS)
                        </button>
                        <button 
                          onClick={() => handleViewPhotos(prop)}
                          className="flex-1 flex justify-center items-center gap-2 bg-white/70 border border-white/80 text-slate-700 px-4 py-3 rounded-xl text-sm font-bold hover:bg-white transition shadow-sm"
                        >
                          <CameraIcon className="h-5 w-5" />
                          View Gallery
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Add Property Form */}
          <div className="h-fit sticky top-28">
            <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/60">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                  <PlusIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">New Project</h2>
              </div>
              
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Project Name</label>
                  <input className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm" placeholder="e.g. East Legon Mansion" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} required />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">GPS Address</label>
                  <input className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm" placeholder="e.g. GA-123-4567" value={newProp.gps_location} onChange={e => setNewProp({...newProp, gps_location: e.target.value})} required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Caretaker Phone</label>
                  <input className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm" placeholder="0244..." value={newProp.caretaker_phone} onChange={e => setNewProp({...newProp, caretaker_phone: e.target.value})} required />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-slate-500 mb-1 uppercase">Description</label>
                  <textarea className="w-full bg-white/50 border border-white/60 p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none shadow-sm resize-none" rows="3" placeholder="Brief details..." value={newProp.description} onChange={e => setNewProp({...newProp, description: e.target.value})} />
                </div>
                
                <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-2">
                  Create Project
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* --- Glass Modal --- */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/60 animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200/50 flex justify-between items-center bg-white/50 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{selectedProperty?.name}</h2>
                <p className="text-sm font-medium text-slate-500">Project Gallery</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white hover:bg-red-50 text-slate-500 hover:text-red-500 p-2 rounded-full transition shadow-sm border border-slate-100">
                <span className="font-bold px-2 text-lg">✕</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 overflow-y-auto bg-slate-50/50 flex-1">
              {modalLoading ? <Spinner /> : visits.length === 0 ? (
                <div className="text-center py-24 text-slate-400">
                  <CameraIcon className="h-20 w-20 mx-auto text-slate-200 mb-4" />
                  <p className="text-lg font-medium">No updates yet.</p>
                  <p className="text-sm">Subscribe to get your first report!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {visits.map((visit, index) => (
                    <div key={index} className="group bg-white rounded-2xl p-3 shadow-sm border border-slate-100 hover:shadow-xl transition duration-300">
                      <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3">
                        {visit.photo_url ? (
                           <img src={visit.photo_url} alt="Site Progress" className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 text-sm font-medium">No Image Uploaded</div>
                        )}
                        <div className="absolute top-3 right-3">
                           <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider ${visit.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-orange-400 text-white'}`}>
                             {visit.status}
                           </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                          {new Date(visit.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs font-semibold text-blue-600">View Details &rarr;</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;