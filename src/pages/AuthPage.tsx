// pages/AuthPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Sparkles, Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../redux/slices/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
  stopLoading,
} from "../redux/slices/authSlice";
import { addToast } from "../redux/slices/uiSlice";
import api from "../utils/api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  email: string;
  sub: string; 
  exp: number;
  iat: number;
}

interface FormData {
  email: string;
  username: string;
  password: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching modes
  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
  }, [isLogin, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    // Email validation (only for signup)
    if (!isLogin) {
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (
      !isLogin &&
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
    ) {
      errors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };


  // Login function
  const handleLogin = async () => {
    try {
      dispatch(loginStart());

      // Call login API
      const response = await api.post("/auth/v1/signin", {
        username: formData.username,
        password: formData.password,
      });

      // Extract token
      const authToken = response?.data;
      if (!authToken) {
        throw new Error("No token received from server");
      }

      // Store token in localStorage
      localStorage.setItem("authToken", authToken);

      // Decode token payload
      const decoded: TokenPayload = jwtDecode(authToken);

      // Dispatch success action with user info from token
      dispatch(
        loginSuccess({
          user: {
            id: decoded.userId,
            name: formData.username,
            username: formData.username,
            email: decoded.email,
            avatar: "",
            isVerified: false,
            role: 'user',
            stats: {
              posts: 0,
              followers: 0,
              following: 0
            }
          },
          token: authToken,
        })
      );

      // Show success toast
      dispatch(
        addToast({
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${formData.username}!`,
          duration: 3000,
        })
      );

      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";

      dispatch(loginFailure(errorMessage));

      dispatch(
        addToast({
          type: "error",
          title: "Login Failed",
          message: errorMessage,
          duration: 5000,
        })
      );
    }
  };

  // Signup function
  const handleSignup = async () => {
    try {
      dispatch(loginStart());

      // Call signup API
      const response = await api.post("/auth/v1/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Show success toast
      dispatch(
        addToast({
          type: "success",
          title: "Account Created",
          message: response.data,
          duration: 3000,
        })
      );
      
      setIsLogin(true);
      dispatch(stopLoading());
    } catch (error: any) {
      console.error("Signup error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Signup failed. Please try again.";

      dispatch(loginFailure(errorMessage));

      // Show error toast
      dispatch(
        addToast({
          type: "error",
          title: "Signup Failed",
          message: errorMessage,
          duration: 5000,
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Call appropriate function based on mode
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", password: "", email: "" });
    setValidationErrors({});
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Floating anime elements */}
      <div
        className="absolute top-20 left-20 animate-bounce text-pink-300/60"
        style={{ animationDelay: "0.3s" }}
      >
        <Sparkles size={32} />
      </div>
      <div
        className="absolute top-40 right-32 animate-bounce text-red-300/60"
        style={{ animationDelay: "0.7s" }}
      >
        <Heart size={24} />
      </div>
      <div
        className="absolute bottom-32 left-32 animate-bounce text-cyan-300/60"
        style={{ animationDelay: "1s" }}
      >
        <Sparkles size={40} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 md:px-0">
        <div className="glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Solo
              <span className="text-gradient-rose">
                Blog
              </span>
            </h1>
            <p className="text-gray-300">
              {isLogin ? "Welcome back, otaku!" : "Join our anime community!"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-300 hover:text-white"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Sign Up
            </button>
          </div>

          {/* Global Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field (only for signup) */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-white/20"
                    } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-2 text-red-400 text-sm ml-4">
                    {validationErrors.email}
                  </p>
                )}
              </div>
            )}

            {/* Username Field */}
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-4 py-4 bg-white/10 border ${
                    validationErrors.username
                      ? "border-red-500"
                      : "border-white/20"
                  } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-2 text-red-400 text-sm ml-4">
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={
                    isLogin ? "Enter your password" : "Create a password"
                  }
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-4 bg-white/10 border ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-white/20"
                  } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-2 text-red-400 text-sm ml-4">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </span>
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Switch Mode Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={switchMode}
                disabled={isLoading}
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors focus:outline-none disabled:opacity-50"
              >
                {isLogin ? "Sign up here" : "Sign in here"}
              </button>
            </p>
          </div>

          {/* Forgot Password Link (only for login) */}
          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                disabled={isLoading}
                className="text-gray-400 hover:text-pink-300 text-sm transition-colors focus:outline-none disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
