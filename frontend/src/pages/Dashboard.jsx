import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // This request carries the in-memory access token via the axios
    // interceptor. If it's expired, the response interceptor transparently
    // refreshes it using the httpOnly cookie and retries.
    api
      .get("/dashboard")
      .then((res) => setMessage(res.data.message))
      .catch(() => setMessage("Could not load dashboard data"));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-700 mb-1">
          Welcome{user ? `, ${user.name}` : ""}!
        </p>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
