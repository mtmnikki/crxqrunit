import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/state/auth';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

/**
 * Login page with email/password authentication
 * Redirects based on user role after successful login
 */
export default function Login() {
  const navigate = useNavigate();
  const { login, bypassLogin, isLoading, initialize, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [altPressed, setAltPressed] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Initialize auth state on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
      console.log('🔄 Already authenticated, redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Alt key detection for bypass links
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !altPressed) {
        setAltPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey && altPressed) {
        setAltPressed(false);
      }
    };

    const handleWindowBlur = () => {
      setAltPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [altPressed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      
      // Navigation will be handled by auth state change - no explicit navigation needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    }
  };

  const handleBypassClick = (userType: 'member' | 'admin', e: React.MouseEvent) => {
    e.preventDefault();
    if (e.altKey) {
      bypassLogin(userType);
      // Navigation will be handled by auth state change
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>

        <Card>
          {/* Hidden bypass links */}
          <div className="relative">
            {/* Member bypass link - upper left */}
            <button
              onClick={(e) => handleBypassClick('member', e)}
              className={`absolute top-2 left-2 w-4 h-4 bg-transparent border-none outline-none z-10 ${
                altPressed ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                opacity: altPressed ? 0.1 : 0,
                backgroundColor: altPressed ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
              }}
              title={altPressed ? 'Member Access' : ''}
              tabIndex={-1}
            />
            
            {/* Admin bypass link - upper right */}
            <button
              onClick={(e) => handleBypassClick('admin', e)}
              className={`absolute top-2 right-2 w-4 h-4 bg-transparent border-none outline-none z-10 ${
                altPressed ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                opacity: altPressed ? 0.1 : 0,
                backgroundColor: altPressed ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
              }}
              title={altPressed ? 'Admin Access' : ''}
              tabIndex={-1}
            />
          </div>
          
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-brand-gradient rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <CardTitle>Sign in to ClinicalRxQ</CardTitle>
            <CardDescription>
              Access your clinical programs and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-gradient hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Demo accounts:{' '}
                <button 
                  type="button"
                  onClick={() => setFormData({ email: 'member@example.com', password: 'password' })}
                  className="text-blue-600 hover:underline"
                >
                  Member
                </button>
                {' | '}
                <button 
                  type="button"
                  onClick={() => setFormData({ email: 'admin@example.com', password: 'password' })}
                  className="text-blue-600 hover:underline"
                >
                  Admin
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}