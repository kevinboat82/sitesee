import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProperty = () => {
  const navigate = useNavigate();
  
  // Form State
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
      
      // Configuration with Auth Token
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      // Send data to backend
      await axios.post('https://sitesee-api.onrender.com/api/properties', formData, config);
      
      // If successful, go back to dashboard
      navigate('/dashboard'); 
      
    } catch (err) {
      console.error(err);
      setError('Failed to add property. Please make sure all fields are filled.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Property</h2>
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800">
                Cancel
            </button>
        </div>

        {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Property Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name / Title</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Oyarifa Land Project"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
            <input
              type="text"
              name="address"
              value={address}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Near Oyarifa Mall, Accra"
              required
            />
          </div>

          {/* Google Maps Link (Optional but helpful) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link (Optional)</label>
            <input
              type="text"
              name="google_maps_link"
              value={google_maps_link}
              onChange={onChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="https://maps.google.com/..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
            <textarea
              name="description"
              value={description}
              onChange={onChange}
              rows="3"
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="What should the scout look for? e.g. Check for encroachment."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition duration-200 
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'}`}
          >
            {loading ? 'Saving...' : 'Save Property'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProperty;