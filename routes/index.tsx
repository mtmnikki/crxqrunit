import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/state/auth';

// Lazy load shells and pages for code splitting
const PublicShell = React.lazy(() => import('@/components/layout/PublicShell'));
const MemberShell = React.lazy(() => import('@/components/layout/MemberShell'));
const AdminShell = React.lazy(() => import('@/components/layout/AdminShell'));

// Public pages
const Home = React.lazy(() => import('@/pages/Home'));
const About = React.lazy(() => import('@/pages/About'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Signup = React.lazy(() => import('@/pages/auth/Signup'));

// Member pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Resources = React.lazy(() => import('@/pages/Resources'));
const Programs = React.lazy(() => import('@/pages/Programs'));
const ProgramDetail = React.lazy(() => import('@/pages/ProgramDetail'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const MemberManagement = React.lazy(() => import('@/pages/admin/MemberManagement'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

// Route guards
function ProtectedRoute({ 
  children, 
  requireRole 
}: { 
  children: React.ReactNode;
  requireRole?: 'member' | 'admin';
}) {
  const { isAuthenticated, user, initialize } = useAuth();
  
  // Ensure auth state is initialized
  React.useEffect(() => {
    initialize();
  }, [initialize]);
  
  // Handle logout state - redirect immediately if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !user) {
      console.log('🚪 ProtectedRoute: User not authenticated, redirecting to login');
      window.location.href = '/login';
    }
  }, [isAuthenticated, user]);
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, initialize } = useAuth();
  
  // Ensure auth state is initialized
  React.useEffect(() => {
    initialize();
  }, [initialize]);
  
  if (isAuthenticated && user) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Router configuration
export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicShell />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        )
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        )
      }
    ]
  },

  // Authentication
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      </PublicRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Suspense fallback={<PageLoader />}>
          <Signup />
        </Suspense>
      </PublicRoute>
    )
  },

  // Member routes
  {
    path: '/',
    element: (
      <ProtectedRoute requireRole="member">
        <Suspense fallback={<PageLoader />}>
          <MemberShell />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'resources',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Resources />
          </Suspense>
        )
      },
      {
        path: 'programs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Programs />
          </Suspense>
        )
      },
      {
        path: 'program/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramDetail />
          </Suspense>
        )
      }
    ]
  },

  // Admin routes
  {
    path: '/',
    element: (
      <ProtectedRoute requireRole="admin">
        <Suspense fallback={<PageLoader />}>
          <AdminShell />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'admin',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        )
      },
      {
        path: 'admin/members',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MemberManagement />
          </Suspense>
        )
      }
    ]
  },

  // Catch all - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);