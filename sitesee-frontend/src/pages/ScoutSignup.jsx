import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import your AuthContext

const ScoutSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use your context login function if available, or manual

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const { full_name, email, phone, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('https://sitesee-api.onrender.com/api/auth/register', {
        full_name,
        email,
        phone,
        password,
        role: 'SCOUT' // <--- Force the role to SCOUT
      });

      // Save token
      localStorage.setItem('token', res.data.token);
      
      // If you are using AuthContext, update it:
      // login(res.data.token); 

      // Redirect immediately to Scout Dashboard
      navigate('/scout');

    } catch (err) {
      console.error(err);
      alert('Error signing up. Email might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400">⚡ Become a Scout</h1>
            <p className="text-gray-400 mt-2">Join the SiteSee field team.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">Full Name</label>
            <input 
                type="text" 
                name="full_name" 
                value={full_name} 
                onChange={onChange} 
                required 
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">Email Address</label>
            <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange} 
                required 
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">Phone Number</label>
            <input 
                type="text" 
                name="phone" 
                value={phone} 
                onChange={onChange} 
                required 
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-1">Password</label>
            <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange} 
                required 
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-3 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition transform hover:scale-105">
            Create Scout Account
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already a scout? <Link to="/login" className="text-yellow-400 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default ScoutSignup;