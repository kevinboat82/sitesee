// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScoutDashboard from "./pages/ScoutDashboard"; // Import it
import AddProperty from './pages/AddProperty'; // (Adjust path if needed)
import PropertyDetails from './pages/PropertyDetails';
import ScoutSignup from './pages/ScoutSignup';
import ScoutLogin from "./pages/ScoutLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scout" element={<ScoutDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* Admin Route */}
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/scout-login" element={<ScoutLogin />} />
          <Route path="/scout-join" element={<ScoutSignup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;