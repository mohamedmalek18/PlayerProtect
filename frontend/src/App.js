import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Performance from "./pages/Performance";
import Risk from "./pages/Risk";
import Injuries from "./pages/Injuries";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };
  const handleUpdate = (updatedUser) => setUser(updatedUser);

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/players" element={<Players />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/injuries" element={<Injuries />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/profile" element={<Profile user={user} onUpdate={handleUpdate} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
