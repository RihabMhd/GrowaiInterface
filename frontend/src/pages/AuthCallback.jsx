import { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        await login(token);
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    };

    handleAuth();
  }, [location, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-medium text-gray-300">Authenticating...</h2>
        <p className="text-gray-500 text-sm mt-2">Please wait while we connect your account</p>
      </div>
    </div>
  );
}