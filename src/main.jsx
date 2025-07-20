import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { initializeTheme } from './utils'
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

// Import all page components
import Home from './pages/Home'
import MyDreams from './pages/MyDreams'
import Dream from './pages/Dream'
import Explore from './pages/Explore'
import Reflections from './pages/Reflections'
import Analytics from './pages/Reflections/components/Analytics'
import FavoritesAndNotes from './pages/Reflections/components/FavoritesAndNotes'
import Connections from './pages/Connections'
import Whispers from './pages/Connections/components/Whispers'
import Reactions from './pages/Connections/components/Reactions'
import Circles from './pages/Connections/components/Circles'
import LogDream from './pages/LogDream'
import Settings from './pages/Settings'
import Signup from './pages/Settings/Signup';
import { BackendUserProvider, useBackendUser } from './hooks/useUsers.jsx'

function Logout() {
  const { logout } = useAuth0();
  useEffect(() => {
    logout({ returnTo: window.location.origin });
  }, [logout]);
  return <div className='flex justify-center items-center h-screen'><span className='loading loading-spinner loading-lg'></span></div>;
}

// Wrapper to redirect new users to /signup if profile is incomplete
function RequireProfile({ children }) {
  const { backendUser, loading } = useBackendUser();
  const location = useLocation();
  if (loading) return <div className='flex justify-center items-center h-screen'><span className='loading loading-spinner loading-lg'></span></div>;
  if (backendUser && (!backendUser.firstName || !backendUser.lastName) && location.pathname !== '/signup') {
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
      <Route path='/log' element={<LogDream />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/settings' element={<RequireProfile><Settings /></RequireProfile>} />
      
      {/* Sub-routes */}
      <Route path='/connections/whispers' element={<Whispers />} />
      <Route path='/connections/reactions' element={<Reactions />} />
      <Route path='/connections/circles' element={<Circles />} />
      
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
    <Auth0Provider
      domain={import.meta.env.VITE_CLIENT_DOMAIN}
      clientId={import.meta.env.VITE_CLIENT_ID}
      audience={import.meta.env.VITE_API_IDENTIFIER}
      authorizationParams={{ 
        redirect_uri: window.location.origin,
        scope: "openid profile email"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      skipRedirectCallback={window.location.pathname === '/callback'}
      onRedirectCallback={(appState) => {
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname
        );
      }}
      advancedOptions={{
        defaultScope: 'openid profile email'
      }}
    >
      <BackendUserProvider>
        <AppRoutes />
      </BackendUserProvider>
    </Auth0Provider>
  </StrictMode>
)
