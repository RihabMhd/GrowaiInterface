import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await forgotPassword(data.email);
      setStatus({ type: "success", message: response.message || "Password reset link sent to your email." });
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Failed to send reset link. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-gray-400">Enter your email to receive a reset link</p>
        </div>

        {status.message && (
          <div className={`p-3 rounded-lg mb-6 text-sm border ${status.type === "success" ? "bg-green-500/20 border-green-500/50 text-green-200" : "bg-red-500/20 border-red-500/50 text-red-200"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <button type="submit" className="btn-primary w-full mt-6" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-primary hover:text-primary-hover">
            &larr; Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
