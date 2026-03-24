// pages/AuthPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Sparkles, Heart, Camera, X, Check } from "lucide-react";
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
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { API_BASE_URL } from "../config";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

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
  bio: string;
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
    bio: "",
  });
  
  // Profile Pic & Crop States
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        setProfilePic(croppedImage);
        setProfilePicPreview(URL.createObjectURL(croppedImage));
        setIsCropping(false);
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error(e);
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
      localStorage.setItem("soloblogger_token", authToken);

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
            role: "user",
            stats: {
              posts: 0,
              followers: 0,
              following: 0,
            },
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
          message: "Account created successfully! Please login.",
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
        error.response?.data ||
        error.message ||
        "Signup failed. Please try again.";

      dispatch(loginFailure(errorMessage));

      // Show error toast
      dispatch(
        addToast({
          type: "error",
          title: "Signup Failed",
          message: typeof errorMessage === "string" ? errorMessage : "Signup failed",
          duration: 5000,
        })
      );
    }
  };

  const handleGoogleLogin = () => {
    // Dynamically generate the backend OAuth2 URL based on API_BASE_URL
    const backendBase = API_BASE_URL.replace(/\/api$/, '') || 'http://localhost:8080';
    window.location.href = `${backendBase}/oauth2/authorization/google`;
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
    setFormData({ username: "", password: "", email: "", bio: "" });
    setProfilePic(null);
    setProfilePicPreview(null);
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

      <div className="relative z-10 w-full max-w-md px-4 md:px-0 mt-10">
        <div className="glass-panel rounded-2xl md:rounded-3xl p-6 md:p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Solo
              <span className="text-gradient-rose">Blog</span>
            </h1>
            <p className="text-gray-300">
              {isLogin ? "Welcome back, otaku!" : "Join our anime community!"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-6">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar Upload (Only for Signup) */}
            {/* {!isLogin && (
              <div className="flex flex-col items-center justify-center mb-6">
                <div 
                  className="relative w-24 h-24 rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-pink-400 transition-colors group overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {profilePicPreview ? (
                    <img src={profilePicPreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-gray-400 group-hover:text-pink-400 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Upload Profile Picture</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
              </div>
            )} */}

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
                    className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-white/20"
                    } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-red-400 text-xs ml-4">
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
                  className={`w-full pl-12 pr-4 py-3 bg-white/10 border ${
                    validationErrors.username
                      ? "border-red-500"
                      : "border-white/20"
                  } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-red-400 text-xs ml-4">
                  {validationErrors.username}
                </p>
              )}
            </div>

             {/* Bio Field (only for signup) */}
             {/* {!isLogin && (
              <div>
                <div className="relative">
                  <textarea
                    name="bio"
                    placeholder="Short bio (optional)"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 focus:bg-white/15 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  />
                </div>
              </div>
            )} */}

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
                  className={`w-full pl-12 pr-12 py-3 bg-white/10 border ${
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
                <p className="mt-1 text-red-400 text-xs ml-4">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="shrink-0 px-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white/5 border border-white/10 text-white font-medium rounded-2xl shadow-sm hover:bg-white/10 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Switch Mode Link */}
          <div className="mt-6 text-center">
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
        </div>
      </div>

      {/* Cropper Modal */}
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1a1a2e] w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-semibold text-lg">Crop Profile Picture</h3>
              <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-gray-400 hover:text-white transition-colors p-1 bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-80 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-4 bg-[#1a1a2e]">
              <div className="mb-4">
                <label className="text-xs text-gray-400 block mb-2">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCropping(false); setImageSrc(null); }}
                  className="px-4 py-2 rounded-xl text-gray-300 font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showCroppedImage}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-medium shadow-lg hover:shadow-primary/30 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Check size={18} />
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
