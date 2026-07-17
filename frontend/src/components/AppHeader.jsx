import React from 'react';
import { motion } from 'framer-motion';
import DecryptedText from './DecryptedText';

function AppHeader({
  user,
  backendOnline,
  settingsDisplayName,
  currentProjectId,
  projects,
  theme,
  scrolled,
  toggleTheme,
  handleCreateProjectBtnClick,
  setCurrentProjectId,
  setShowSettingsModal,
  setShowLogoutModal,
  setAuthMode,
  currentView,
  navigateToView,
}) {
  return (
    // Header
      <header className={`main-header d-flex justify-content-between align-items-center px-4 py-3 ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo-section d-flex align-items-center">
          <div 
            className="brand-logo-container me-2" 
            onClick={() => navigateToView('landing')} 
            style={{ cursor: 'pointer' }}
            title="Go to Landing Page"
          >
            <i className="fa-solid fa-cubes-stacked text-primary"></i>
          </div>
          <span 
            className="brand-name" 
            onClick={() => navigateToView('landing')} 
            style={{ cursor: 'pointer' }}
            title="Go to Landing Page"
          >
            <DecryptedText text="Dokari" hoverTrigger={true} interval={45} />
          </span>
        </div>


        <div className="user-controls-section d-flex align-items-center gap-3">
      

          {user && user.id !== 'demo' ? (
            <>
              <div className={`connection-status d-flex align-items-center gap-1.5 ${backendOnline ? 'online' : 'offline'}`}>
                <span className="status-dot"></span>
                <span className="status-text">{backendOnline ? 'API Connected' : 'API Offline'}</span>
              </div>

              <button 
                onClick={() => setShowSettingsModal(true)} 
                className="user-profile-btn"
                title="Profile Settings"
              >
                <div className="user-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>
                <span className="user-name">{settingsDisplayName || user.username}</span>
              </button>

              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}></i>
                </motion.div>
              </button>

              <button onClick={() => setShowLogoutModal(true)} className="btn-logout" title="Logout">
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setAuthMode('login'); navigateToView('auth'); }} 
                className="btn btn-secondary px-3 py-1.5 fw-semibold"
              >
                Sign In
              </button>

              <button 
                onClick={() => { setAuthMode('signup'); navigateToView('auth'); }} 
                className="btn btn-primary px-3 py-1.5 fw-semibold"
              >
                Register
              </button>

              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
                <motion.div
                  key={theme}
                  initial={{ rotate: -180, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <i className={theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun'}></i>
                </motion.div>
              </button>
            </>
          )}
        </div>
      </header>
  );
}

export default AppHeader;
