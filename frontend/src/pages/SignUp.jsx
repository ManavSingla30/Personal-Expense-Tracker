import React, { useState } from 'react';
import { DollarSign, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    branch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const onNavigateToLogin = () => {
    navigate('/login');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.branch) {
      newErrors.branch = 'Please select a branch';
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...signupData } = formData;
      
      const res = await fetch(`${API_URL}/api/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(signupData)
      });

      const data = await res.json();

      if (res.ok && res.status === 201) {
        navigate('/dashboard');
      } else if (res.status === 400) {
        setErrors({ general: data.message || 'User with this email or username already exists' });
      } else {
        setErrors({ general: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    if (errors.general) {
      setErrors({
        ...errors,
        general: ''
      });
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Medium', color: 'bg-yellow-500' };
    return { strength, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Start tracking your expenses today</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* [Rest of the form fields remain the same - just the fetch URL was updated above] */}
          {/* Copy the rest from your original SignupPage */}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <button 
              onClick={onNavigateToLogin}
              className="text-purple-600 hover:text-purple-700 font-medium ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;