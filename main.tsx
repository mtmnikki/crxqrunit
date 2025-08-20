import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { router } from './routes';
import { useAuth } from './state/auth';
import './index.css';

// Initialize auth state and handle redirects
const initializeApp = async () => {
  await useAuth.getState().initialize();
  
  // Handle redirect after auth initialization
  const { isAuthenticated, getRedirectPath } = useAuth.getState();
  if (isAuthenticated && window.location.pathname === '/') {
    window.history.replaceState(null, '', getRedirectPath());
  }
};

initializeApp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
