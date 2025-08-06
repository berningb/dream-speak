import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { initializeTheme } from './utils'
import { useEffect } from 'react';

// Import Firebase Auth
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';

// Import all page components
import Home from './pages/Home'
import MyDreams from './pages/MyDreams'
import Dream from './pages/Dream'
import Explore from './pages/Explore'
import Reflections from './pages/Reflections'
import Analytics from './pages/Reflections/components/Analytics'
import FavoritesAndNotes from './pages/Reflections/components/FavoritesAndNotes'
import Connections from './pages/Connections'
// import Whispers from './pages/Connections/components/Whispers'
// import Reactions from './pages/Connections/components/Reactions'
// import Circles from './pages/Connections/components/Circles'

import Settings from './pages/Settings'
import Signup from './pages/Settings/Signup';

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

// Routes component to avoid duplication
const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Main routes */}
      <Route path='/' element={<Home />} />
      <Route path='/home' element={<Home />} />
      <Route path='/my-dreams' element={<MyDreams />} />
      <Route path='/explore' element={<Explore />} />
      <Route path='/reflections' element={<Reflections />} />
      <Route path='/reflections/analytics' element={<Analytics />} />
      <Route path='/reflections/favorites' element={<FavoritesAndNotes />} />
      <Route path='/connections' element={<Connections />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/settings' element={<RequireProfile><Settings /></RequireProfile>} />
      
      {/* Sub-routes - Coming Soon */}
      <Route path='/connections/whispers' element={<div>Coming Soon</div>} />
      <Route path='/connections/reactions' element={<div>Coming Soon</div>} />
      <Route path='/connections/circles' element={<div>Coming Soon</div>} />
      
      {/* Dream detail route */}
      <Route path='/dream/:id' element={<Dream />} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path='/all-dreams' element={<Explore />} />
      <Route path='/user' element={<RequireProfile><Settings /></RequireProfile>} />
      <Route path='/logout' element={<Logout />} />
    </Routes>
  </Router>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <AppRoutes />
    </FirebaseAuthProvider>
  </StrictMode>
);
