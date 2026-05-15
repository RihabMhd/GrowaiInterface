import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../auth/AuthContext";
import { loginUser } from "../services/authService";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await loginUser(data);
      if (response.data && response.data.token) {
        await login(response.data.token);
        navigate("/dashboard");
      } else {
        // Fallback depending on backend structure
        await login(response.token || response.access_token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google/redirect";
  };

  const facebookLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/facebook/redirect";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your agency account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@agency.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-hover">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t border-gray-600/50"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">or continue with</span>
          <div className="flex-grow border-t border-gray-600/50"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={googleLogin} className="btn-outline">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
          <button onClick={facebookLogin} className="btn-outline">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2.04C6.5,2.04,2,6.53,2,12.06C2,17.06,5.66,21.21,10.44,21.96V14.96H7.9V12.06H10.44V9.85C10.44,7.34,11.93,5.96,14.22,5.96C15.31,5.96,16.45,6.15,16.45,6.15V8.62H15.19C13.95,8.62,13.56,9.39,13.56,10.18V12.06H16.34L15.89,14.96H13.56V21.96A10,10,0,0,0,22,12.06C22,6.53,17.5,2.04,12,2.04Z"/>
            </svg>
            Facebook
          </button>
        </div>
      </div>
    </div>
  );
}