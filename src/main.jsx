import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useParams } from 'react-router-dom'
import { initializeTheme } from './utils'
import { useEffect } from 'react';

// Import Firebase Auth
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';
import { BackendUserProvider } from './hooks/useUsers';

// Import all page components
import Home from './pages/Home'
import MyDreams from './pages/MyDreams'
import Dream from './pages/Dream'
import Explore from './pages/Explore'
import Analytics from './pages/Analytics'
import Favorites from './pages/Favorites'
import Connections from './pages/Connections'
import UserProfile from './pages/UserProfile'

import Layout from './components/Layout'
import Settings from './pages/Settings'
import Signup from './pages/Settings/Signup'
function EditDreamRedirect() {
  const { id } = useParams()
  return <Navigate to={`/dream/${id}`} replace />
}

function Logout() {
  const { logout } = useFirebaseAuth();
  useEffect(() => {
    logout();
  }, [logout]);
  return <div className='flex justify-center items-center h-screen'><span className='loading loading-spinner loading-lg'></span></div>;
}

// Wrapper to redirect new users to /signup if profile is incomplete
function RequireProfile({ children }) {
  const { user, loading } = useFirebaseAuth();
  const location = useLocation();
  
  if (loading) return <div className='flex justify-center items-center h-screen'><span className='loading loading-spinner loading-lg'></span></div>;
  
  if (user && (!user.displayName) && location.pathname !== '/signup') {
    return <Navigate to='/signup' replace />;
  }
  
  return children;
}

// Initialize theme immediately
initializeTheme();

const AppRoutes = () => (
  <Router>
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/explore/feed' element={<Explore />} />
        <Route path='/explore/search' element={<Explore />} />
        <Route path='/explore/shared' element={<Explore />} />
        <Route path='/my-dreams' element={<MyDreams />} />
        <Route path='/my-dreams/list' element={<MyDreams />} />
        <Route path='/my-dreams/tags' element={<MyDreams />} />
        <Route path='/my-dreams/privacy' element={<MyDreams />} />
        <Route path='/favorites' element={<Favorites />} />
        <Route path='/connections' element={<Connections />} />
        <Route path='/user/:id' element={<UserProfile />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/settings' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/settings/profile' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/settings/privacy' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/settings/notifications' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/settings/export' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/dream/:id' element={<Dream />} />
        <Route path='/edit-dream/:id' element={<EditDreamRedirect />} />
        <Route path='/all-dreams' element={<Explore />} />
        <Route path='/user' element={<RequireProfile><Settings /></RequireProfile>} />
        <Route path='/logout' element={<Logout />} />
      </Routes>
    </Layout>
  </Router>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <BackendUserProvider>
        <AppRoutes />
      </BackendUserProvider>
    </FirebaseAuthProvider>
  </StrictMode>
);
