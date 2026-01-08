// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScoutDashboard from "./pages/ScoutDashboard"; // Import it
import AddProperty from './pages/AddProperty'; // (Adjust path if needed)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scout" element={<ScoutDashboard />} /> {/* Add it */}
          <Route path="/add-property" element={<AddProperty />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;