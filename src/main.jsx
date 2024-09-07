import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import User from './pages/User';
import MyDreams from './pages/MyDreams';
import AllDreams from './pages/AllDreams';

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
          <Route path="/" element={<AllDreams />} />
          <Route path="/my-dreams" element={<MyDreams />} />
          <Route path="/user" element={<User />} />
        </Routes>
      </Router>
    </Auth0Provider>
  </StrictMode>,
)
