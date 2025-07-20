import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { initializeTheme } from './utils'

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

// Initialize theme immediately
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_CLIENT_DOMAIN}
      clientId={import.meta.env.VITE_CLIENT_ID}
      audience={import.meta.env.VITE_API_IDENTIFIER}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
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
          <Route path='/settings' element={<Settings />} />
          
          {/* Sub-routes */}


          <Route path='/connections/whispers' element={<Whispers />} />
          <Route path='/connections/reactions' element={<Reactions />} />
          <Route path='/connections/circles' element={<Circles />} />
          
          {/* Dream detail route */}
          <Route path='/dream/:id' element={<Dream />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path='/all-dreams' element={<Explore />} />
          <Route path='/user' element={<Settings />} />
        </Routes>
      </Router>
    </Auth0Provider>
  </StrictMode>
)
