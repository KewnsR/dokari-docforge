import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function AppModals({
  showLogoutModal,
  showNewProjectModal,
  showSettingsModal,
  showFixModal,
  selectedFileInspector,
  settingsDisplayName,
  settingsModel,
  settingsPassword,
  settingsLoading,
  newProjectName,
  newProjectDesc,
  projectTemplate,
  fixingLoading,
  docFixProposal,
  selectedFixSuggestion,
  currentProject,
  user,
  setShowLogoutModal,
  confirmLogout,
  createProject,
  setSettingsDisplayName,
  setSettingsModel,
  setSettingsPassword,
  setShowSettingsModal,
  handleUpdateProfile,
  setNewProjectName,
  setNewProjectDesc,
  setProjectTemplate,
  setShowNewProjectModal,
  copyDocFix,
  deleteFile,
  setSelectedFileInspector,
  setShowFixModal,
  showToast,
}) {
  return (
    <>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="modal-card" 
              style={{ maxWidth: '420px', width: '90%' }}
            >
              <div className="modal-header-custom d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <div className="d-flex align-items-center text-warning fs-5 fw-bold">
                  <i className="fa-solid fa-right-from-bracket me-2"></i>
                  <span>Confirm Sign Out</span>
                </div>
                <button onClick={() => setShowLogoutModal(false)} className="btn-modal-close" title="Close">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              
              <p className="text-muted mb-4 fs-6">
                Are you sure you want to log out of your account? Your projects and uploaded source files will remain securely stored in your account.
              </p>

              <div className="d-flex gap-2 justify-content-end">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="btn btn-secondary px-4 py-2 fw-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmLogout} 
                  className="btn btn-danger px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="modal-card"
            >
              <div className="modal-header-custom d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <h5 className="modal-title m-0">Create New Project</h5>
                <button onClick={() => setShowNewProjectModal(false)} className="btn-modal-close" type="button">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={createProject}>
                <div className="form-group mb-3">
                  <label htmlFor="projectName" className="form-label-custom">Project Name</label>
                  <input 
                    type="text" 
                    id="projectName" 
                    className="form-control-custom"
                    value={newProjectName} 
                    onChange={(e) => setNewProjectName(e.target.value)} 
                    placeholder="e.g. Dokari Web App"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group mb-4">
                  <label htmlFor="projectDesc" className="form-label-custom">Description (Optional)</label>
                  <textarea 
                    id="projectDesc" 
                    className="form-control-custom"
                    value={newProjectDesc} 
                    onChange={(e) => setNewProjectDesc(e.target.value)} 
                    placeholder="What is this project about?"
                    rows="3"
                  />
                </div>

                <div className="modal-actions-custom d-flex justify-content-end gap-2">
                  <button type="button" onClick={() => setShowNewProjectModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile & Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="modal-backdrop-custom d-flex align-items-center justify-content-center">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="modal-card text-start"
              style={{ maxWidth: '440px', width: '95%' }}
            >
              <div className="modal-header-custom d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <h5 className="modal-title fw-bold m-0"><i className="fa-solid fa-user-gear text-primary me-2"></i>Workspace Settings</h5>
                <button onClick={() => { setShowSettingsModal(false); setSettingsPassword(''); }} className="btn-modal-close" type="button" title="Close">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="d-flex flex-column gap-3">
                <div className="form-group">
                  <label className="form-label-custom fs-7 fw-bold text-secondary text-uppercase mb-1.5" style={{ letterSpacing: '0.03em' }}>Username (Read-only)</label>
                  <input 
                    type="text" 
                    className="form-control-custom bg-panel border text-muted" 
                    value={user?.username || ''} 
                    disabled 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-custom fs-7 fw-bold text-secondary text-uppercase mb-1.5" style={{ letterSpacing: '0.03em' }}>Display Name</label>
                  <input 
                    type="text" 
                    className="form-control-custom bg-panel border" 
                    placeholder="Enter full display name..."
                    value={settingsDisplayName}
                    onChange={(e) => setSettingsDisplayName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label-custom fs-7 fw-bold text-secondary text-uppercase mb-1.5" style={{ letterSpacing: '0.03em' }}>Gemini Model Preference</label>
                  <select 
                    className="form-control-custom w-100 p-2 rounded cursor-pointer"
                    style={{ fontSize: '0.875rem' }}
                    value={settingsModel}
                    onChange={(e) => setSettingsModel(e.target.value)}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast, Recommended)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Advanced Logic)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label-custom fs-7 fw-bold text-secondary text-uppercase mb-1.5" style={{ letterSpacing: '0.03em' }}>Update Password</label>
                  <input 
                    type="password" 
                    className="form-control-custom bg-panel border" 
                    placeholder="Enter new password (optional)..."
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                  />
                </div>

                <div className="modal-actions-custom d-flex justify-content-end gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => { setShowSettingsModal(false); setSettingsPassword(''); }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-primary-glow"
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Code Documentation Fix Recommendation Modal */}
      <AnimatePresence>
        {showFixModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="modal-card" 
              style={{ maxWidth: '600px', width: '100%' }}
            >
              <div className="modal-header-custom d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <h5 className="modal-title m-0">Suggested Documentation Fix</h5>
                <button onClick={() => setShowFixModal(false)} className="btn-modal-close" type="button">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body-content">
                <p className="fs-7 text-muted mb-2">Recommendation:</p>
                <div className="p-2.5 bg-light rounded border mb-3">
                  <span className="fs-7 fw-semibold text-secondary">{selectedFixSuggestion}</span>
                </div>

                <p className="fs-7 text-muted mb-2">AI-Generated Code/Comment Fix Proposal:</p>
                <div className="position-relative">
                  {fixingLoading ? (
                    <div className="border rounded p-4 text-center bg-light-panel">
                      <span className="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
                      <span className="fs-7 text-muted">Generating documentation fix...</span>
                    </div>
                  ) : (
                    <>
                      <pre className="border rounded p-3 overflow-auto bg-dark text-white fs-7" style={{ maxHeight: '250px' }}>
                        <code>{docFixProposal || 'No fix proposal generated.'}</code>
                      </pre>
                      {docFixProposal && (
                        <button 
                          onClick={copyDocFix} 
                          className="btn btn-secondary btn-sm position-absolute" 
                          style={{ top: '10px', right: '10px', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Copy
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="modal-actions-custom d-flex justify-content-end gap-2 mt-4 border-top pt-3">
                <button type="button" onClick={() => setShowFixModal(false)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Inspector Modal */}
      <AnimatePresence>
        {selectedFileInspector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop-custom d-flex align-items-center justify-content-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="modal-card" 
              style={{ maxWidth: '750px', width: '100%' }}
            >
              <div className="modal-header-custom d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
                <h5 className="modal-title m-0 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-code text-primary"></i>
                  <span>File Inspector — {selectedFileInspector.filename}</span>
                </h5>
                <button onClick={() => setSelectedFileInspector(null)} className="btn-modal-close" type="button">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body-content">
                <div className="d-flex gap-3 mb-3 fs-7 text-muted border-bottom pb-2">
                  <div><strong>Size:</strong> {Math.round((selectedFileInspector.content ? selectedFileInspector.content.length : 0) / 1024 * 10) / 10} KB</div>
                  <div><strong>Lines:</strong> {selectedFileInspector.content ? selectedFileInspector.content.split('\n').length : 0}</div>
                  <div><strong>Extension:</strong> .{selectedFileInspector.filename.split('.').pop()}</div>
                </div>

                <pre className="border rounded p-3 overflow-auto bg-dark text-white fs-7" style={{ maxHeight: '350px', fontFamily: 'monospace' }}>
                  <code>{selectedFileInspector.content}</code>
                </pre>
              </div>

              <div className="modal-actions-custom d-flex justify-content-between align-items-center mt-4 border-top pt-3">
                <button 
                  type="button" 
                  onClick={() => deleteFile(selectedFileInspector.filename)} 
                  className="btn btn-danger d-flex align-items-center gap-2 px-3 py-1.5 fs-7"
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete File
                </button>
                <button type="button" onClick={() => setSelectedFileInspector(null)} className="btn btn-secondary px-3 py-1.5 fs-7">
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AppModals;
