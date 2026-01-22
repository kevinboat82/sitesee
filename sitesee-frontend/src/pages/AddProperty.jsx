import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { HomeModernIcon, MapPinIcon, LinkIcon, DocumentTextIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

// Magic UI Components
import GlassCard from '../components/magicui/GlassCard';
import ShineBorder from '../components/magicui/ShineBorder';
import ShimmerButton from '../components/magicui/ShimmerButton';
import AnimatedGradient from '../components/magicui/AnimatedGradient';
import GridPattern from '../components/magicui/GridPattern';

const AddProperty = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    google_maps_link: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { name, address, description, google_maps_link } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      await axios.post('https://sitesee-api.onrender.com/api/properties', formData, config);
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError('Failed to add property. Please make sure all fields are filled.');
      setLoading(false);
    }
  };

  const inputClasses = `w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none ${darkMode
      ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20'
    }`;

  const labelClasses = `flex items-center gap-2 text-sm font-medium mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>

      {/* Background Effects */}
      {darkMode ? (
        <div className="absolute inset-0 z-0">
          <AnimatedGradient
            colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
            speed={15}
            blur="heavy"
          />
        </div>
      ) : (
        <>
          <GridPattern
            width={32}
            height={32}
            className="absolute inset-0 z-0 opacity-40"
          />
          <div className="absolute inset-0 gradient-mesh z-0" />
        </>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className={`absolute top-6 left-6 z-50 p-3 rounded-full transition-all duration-300 ${darkMode
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-gray-900/10 hover:bg-gray-900/20 text-gray-900'
          }`}
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>

      {/* Form Card */}
      <ShineBorder
        borderRadius={28}
        borderWidth={2}
        duration={12}
        color={darkMode ? ["#3b82f6", "#8b5cf6", "#06b6d4"] : ["#3b82f6", "#60a5fa", "#93c5fd"]}
        className={`relative z-10 !p-0 w-full max-w-md transition-all duration-500 ${darkMode
            ? '!bg-slate-900/90 backdrop-blur-2xl border-white/10 shadow-2xl shadow-blue-500/10'
            : '!bg-white/90 backdrop-blur-2xl border-gray-200/80 shadow-2xl shadow-gray-900/10'
          }`}
      >
        <div className="p-8 animate-fade-up">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-5">
              <div className={`absolute inset-0 blur-2xl opacity-50 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-400'}`} />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-400 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/30">
                <HomeModernIcon className="h-8 w-8" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Property
            </h2>
            <p className={`text-sm text-center ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Start monitoring your property with our scouts.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${darkMode
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Property Name */}
            <div>
              <label className={labelClasses}>
                <HomeModernIcon className="h-4 w-4" />
                Property Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={onChange}
                className={inputClasses}
                placeholder="e.g. Oyarifa Land Project"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className={labelClasses}>
                <MapPinIcon className="h-4 w-4" />
                Location / Address
              </label>
              <input
                type="text"
                name="address"
                value={address}
                onChange={onChange}
                className={inputClasses}
                placeholder="e.g. Near Oyarifa Mall, Accra"
                required
              />
            </div>

            {/* Google Maps Link */}
            <div>
              <label className={labelClasses}>
                <LinkIcon className="h-4 w-4" />
                Google Maps Link
                <span className={`text-xs font-normal ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  (Optional)
                </span>
              </label>
              <input
                type="url"
                name="google_maps_link"
                value={google_maps_link}
                onChange={onChange}
                className={inputClasses}
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelClasses}>
                <DocumentTextIcon className="h-4 w-4" />
                Description / Instructions
              </label>
              <textarea
                name="description"
                value={description}
                onChange={onChange}
                rows="3"
                className={`${inputClasses} resize-none`}
                placeholder="What should the scout look for? e.g. Check for encroachment."
              />
            </div>

            {/* Submit Button */}
            <ShimmerButton
              type="submit"
              disabled={loading}
              shimmerColor={darkMode ? "#60a5fa" : "#3b82f6"}
              shimmerSize="0.08em"
              shimmerDuration="2.5s"
              borderRadius="14px"
              background={darkMode
                ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              }
              className="w-full font-bold text-sm disabled:opacity-60 gap-2 !py-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving Property...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" />
                  Save Property
                </span>
              )}
            </ShimmerButton>

          </form>
        </div>
      </ShineBorder>
    </div>
  );
};

export default AddProperty;