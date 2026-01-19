// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScoutDashboard from "./pages/ScoutDashboard";
import AddProperty from './pages/AddProperty';
import PropertyDetails from './pages/PropertyDetails';
import ScoutSignup from './pages/ScoutSignup';
import ScoutLogin from "./pages/ScoutLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scout" element={<ScoutDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/scout-login" element={<ScoutLogin />} />
          <Route path="/scout-join" element={<ScoutSignup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;