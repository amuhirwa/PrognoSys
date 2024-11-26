import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  User,
  Hospital,
  ChevronRight,
  Shield,
  UserCircle,
  Phone,
  Hash,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import createAxiosInstance from "@/utils/axios";
import { useDispatch } from 'react-redux';
import { addUserLogin, selectCurrentToken } from '@/utils/SharedData';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";

const AuthPages = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [userType, setUserType] = useState("doctor");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const instance = createAxiosInstance();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectCurrentToken);

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [token]);

  const registerSchema = Yup.object({
    name: Yup.string()
      .max(40, "Must be 40 characters or less")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Must be 6 characters or more")
      .required("Password is required"),
  });

  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const loginFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await instance.post("login/", values);
        if (response.status === 200) {
          dispatch(addUserLogin({
            token: response.data.access
          }));
          
          toast.success("Login successful!");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.detail ? "Invalid Credentials" : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await instance.post("register/", values);
        if (response.data.status === 201) {
          toast.success("Registration successful!");
          setIsLogin(true);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.error || "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    },
  });

  const currentFormik = isLogin ? loginFormik : registerFormik;

  return (
    <div className="min-h-screen w-full bg-gray-50 block ml-auto mr-auto flex items-center justify-center p-4 max-md:p-0">
      <div className=" h-full bg-white rounded-2xl  shadow-2xl flex overflow-hidden">
        {/* Left Side - Auth Form */}
        <div className="w-full lg:w-1/2 p-6 md:p-12 xl:p-16 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-xl font-bold">
                P
              </div>
              <span className="text-xl font-bold text-gray-800">rognoSys</span>
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? "Welcome Back!" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Please sign in to continue" : "Register to get started"}
            </p>
          </div>

          <form onSubmit={currentFormik.handleSubmit} className="space-y-6 flex-grow">
            {!isLogin && (
              <>
                <div className="flex gap-4 mb-6">
                  <Button
                    type="button"
                    variant={userType === "doctor" ? "default" : "outline"}
                    className={`w-1/2 gap-2 py-2 ${
                      userType === "doctor" ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    onClick={() => setUserType("doctor")}
                  >
                    <UserCircle className="h-5 w-5" />
                    Doctor
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "staff" ? "default" : "outline"}
                    className={`w-1/2 gap-2 py-2 ${
                      userType === "staff" ? "bg-blue-600 hover:bg-blue-700" : ""
                    }`}
                    onClick={() => setUserType("staff")}
                  >
                    <Hospital className="h-5 w-5" />
                    Staff
                  </Button>
                </div>

                {/* Name Input */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      name="name"
                      id="name"
                      className={`w-full pl-12 py-6 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                        currentFormik.touched.name && currentFormik.errors.name
                          ? "border-red-500"
                          : ""
                      }`}
                      value={currentFormik.values.name}
                      onChange={currentFormik.handleChange}
                      onBlur={currentFormik.handleBlur}
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  {currentFormik.touched.name && currentFormik.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{currentFormik.errors.name}</p>
                  )}
                </div>
              </>
            )}

            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  name="email"
                  id="email"
                  className={`w-full pl-12 py-6 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 ${
                    currentFormik.touched.email && currentFormik.errors.email
                      ? "border-red-500"
                      : ""
                  }`}
                  value={currentFormik.values.email}
                  onChange={currentFormik.handleChange}
                  onBlur={currentFormik.handleBlur}
                  placeholder="doctor@prognosys.com"
                />
              </div>
              {currentFormik.touched.email && currentFormik.errors.email && (
                <p className="text-sm text-red-500 mt-1">{currentFormik.errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  className={`w-full pl-12 pr-12 py-6 border-2 hover:outline-none rounded-xl focus:ring-2 focus:ring-blue-500 ${
                    currentFormik.touched.password && currentFormik.errors.password
                      ? "border-red-500"
                      : ""
                  }`}
                  value={currentFormik.values.password}
                  onChange={currentFormik.handleChange}
                  onBlur={currentFormik.handleBlur}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-0"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {currentFormik.touched.password && currentFormik.errors.password && (
                <p className="text-sm text-red-500 mt-1">{currentFormik.errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Sign Up Link */}
          </form>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:block lg:w-1/2 w-full bg-gradient-to-br from-blue-600 to-blue-800 p-12 xl:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZmZiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSIjMDAwIj48L2NpcmNsZT4KPC9zdmc+')]"></div>
          
          <div className="relative max-w-lg">
            <Shield className="w-16 h-16 mb-6 drop-shadow-lg" />
            <h2 className="text-3xl xl:text-4xl font-bold mb-4">Empowering Healthcare</h2>
            <p className="text-lg mb-8 text-blue-100">
              Advanced predictive analytics for better patient outcomes
            </p>
            
            <div className="space-y-6 bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
              <h3 className="font-semibold text-xl">Key Features:</h3>
              <ul className="space-y-4">
                {[
                  'Predictive Patient Outcomes',
                  'Early Disease Risk Detection',
                  'Personalized Treatment Plans',
                  'Resource Optimization'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3 transition-all hover:translate-x-2">
                    <div className="w-2 h-2 bg-blue-300 rounded-full" />
                    <span className="text-lg text-blue-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
