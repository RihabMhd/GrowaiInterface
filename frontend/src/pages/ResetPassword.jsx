import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
    if (token) {
      setValue("token", token);
    }
  }, [email, token, setValue]);

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await resetPassword(data);
      setStatus({ type: "success", message: response.message || "Password successfully reset!" });
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || "Failed to reset password. The link might be expired." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Link</h1>
          <p className="text-gray-300 mb-6">No reset token found in the URL. Please request a new link.</p>
          <Link to="/forgot-password" className="btn-primary w-full">Request New Link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Password</h1>
          <p className="text-gray-400">Enter your new password below</p>
        </div>

        {status.message && (
          <div className={`p-3 rounded-lg mb-6 text-sm border ${status.type === "success" ? "bg-green-500/20 border-green-500/50 text-green-200" : "bg-red-500/20 border-red-500/50 text-red-200"}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("token")} />
          <input type="hidden" {...register("email")} />

          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register("password", { 
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" }
              })}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register("password_confirmation", { 
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
            />
            {errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{errors.password_confirmation.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-6" disabled={isLoading || status.type === "success"}>
            {isLoading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
