const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join('c:\\Users\\acer\\.gemini\\antigravity\\scratch\\docforge\\frontend');
const src = path.join(root, 'src');
const componentsDir = path.join(src, 'components');
const utf8 = 'utf8';

function readHeadApp() {
  return execSync('git -C "c:\\Users\\acer\\.gemini\\antigravity\\scratch\\docforge" show HEAD:frontend/src/App.jsx', { encoding: utf8 });
}

function between(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing start marker: ${startMarker}`);
  const end = text.indexOf(endMarker, start);
  if (end === -1) throw new Error(`Missing end marker: ${endMarker}`);
  return text.slice(start, end).trim();
}

function stripLeadingMarker(section) {
  return section.replace(/^\s*\/\*.*?\*\/\r?\n/, '').trim();
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content.replace(/\n/g, '\r\n') + '\r\n', utf8);
}

const original = readHeadApp();

const toastSection = stripLeadingMarker(between(original, '      {/* Toast notifications */}', '      {/* Header */}'));
const headerSection = stripLeadingMarker(between(original, '      {/* Header */}', '      {/* Main Workspace */}'));
const workspaceSection = stripLeadingMarker(between(original, '      {/* Main Workspace */}', '      {/* Auth Modal overlay */}'));
const modalsSection = stripLeadingMarker(between(original, '      {/* Auth Modal overlay */}', '      {/* Floating Action Button (AI Chatbot) */}'));
const chatStart = original.indexOf('      {/* Floating Action Button (AI Chatbot) */}');
const chatEnd = original.lastIndexOf('    </div>\n  );\n}');
if (chatStart === -1 || chatEnd === -1) {
  throw new Error('Could not isolate chat section.');
}
const chatSection = stripLeadingMarker(original.slice(chatStart, chatEnd).trim());

writeFile(path.join(componentsDir, 'ToastStack.jsx'), `import React from 'react';

function ToastStack({ toasts }) {
  return (
${toastSection}
  );
}

export default ToastStack;`);

writeFile(path.join(componentsDir, 'AppHeader.jsx'), `import React from 'react';
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
  setShowAuthModal,
}) {
  return (
${headerSection}
  );
}

export default AppHeader;`);

writeFile(path.join(componentsDir, 'WorkspaceDashboard.jsx'), `import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { marked } from 'marked';

function WorkspaceDashboard({
  currentProjectId,
  currentProject,
  uploadedFiles,
  documents,
  activeTab,
  generating,
  fileSearchQuery,
  setFileSearchQuery,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  user,
  fileInputRef,
  uploading,
  showToast,
  handleFiles,
  deleteFile,
  generateDocumentation,
  copyToClipboard,
  exportDoc,
  generateDocFix,
  deleteCurrentProject,
  handleCreateProjectBtnClick,
  docHealthScore,
  docHealthSuggestions,
  healthLoading,
  setActiveTab,
  setSelectedFileInspector,
}) {
  return (
${workspaceSection}
  );
}

export default WorkspaceDashboard;`);

writeFile(path.join(componentsDir, 'AppModals.jsx'), `import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function AppModals({
  showAuthModal,
  showLogoutModal,
  showDeleteConfirmModal,
  showNewProjectModal,
  showSettingsModal,
  showFixModal,
  selectedFileInspector,
  authMode,
  authUsername,
  authPassword,
  showPassword,
  authLoading,
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
  setShowAuthModal,
  setShowLogoutModal,
  confirmLogout,
  setShowDeleteConfirmModal,
  confirmDeleteProject,
  createProject,
  handleAuth,
  setAuthMode,
  setAuthUsername,
  setAuthPassword,
  setShowPassword,
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
}) {
  return (
${modalsSection}
  );
}

export default AppModals;`);

writeFile(path.join(componentsDir, 'ChatWidget.jsx'), `import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function ChatWidget({
  showChatWidget,
  setShowChatWidget,
  chatMessages,
  chatLoading,
  chatInput,
  setChatInput,
  sendChatMessage,
  chatEndRef,
  uploadedFiles,
}) {
  return (
${chatSection}
  );
}

export default ChatWidget;`);

const appPath = path.join(src, 'App.jsx');
let app = original;
app = app.replace(/import \{ marked \} from 'marked';\r?\n/g, '');
app = app.replace(/import \{ motion, AnimatePresence \} from 'framer-motion';\r?\n/g, '');
app = app.replace(/import DecryptedText from '\.\/components\/DecryptedText';\r?\n/g, '');
app = app.replace(/import SplashLandingPage from '\.\/components\/SplashLandingPage';\r?\n/, `import SplashLandingPage from './components/SplashLandingPage';\nimport AppHeader from './components/AppHeader';\nimport WorkspaceDashboard from './components/WorkspaceDashboard';\nimport AppModals from './components/AppModals';\nimport ChatWidget from './components/ChatWidget';\nimport ToastStack from './components/ToastStack';\n`);

const scoreMarker = '  const getScoreColorClass = (score) => {';
const scoreIndex = app.indexOf(scoreMarker);
if (scoreIndex === -1) throw new Error('Could not find score helper marker.');
const returnIndex = app.indexOf('  return (', scoreIndex);
if (returnIndex === -1) throw new Error('Could not find App return block.');
const appTop = app.slice(0, returnIndex).trimEnd();
const appNew = `${appTop}

  return (
    <div className="app-container">
      <ToastStack toasts={toasts} />
      {user ? (
        <>
          <AppHeader
            user={user}
            backendOnline={backendOnline}
            settingsDisplayName={settingsDisplayName}
            currentProjectId={currentProjectId}
            projects={projects}
            theme={theme}
            scrolled={scrolled}
            toggleTheme={toggleTheme}
            handleCreateProjectBtnClick={handleCreateProjectBtnClick}
            setCurrentProjectId={setCurrentProjectId}
            setShowSettingsModal={setShowSettingsModal}
            setShowLogoutModal={setShowLogoutModal}
            setAuthMode={setAuthMode}
            setShowAuthModal={setShowAuthModal}
          />
          <WorkspaceDashboard
            currentProjectId={currentProjectId}
            currentProject={currentProject}
            uploadedFiles={uploadedFiles}
            documents={documents}
            activeTab={activeTab}
            generating={generating}
            fileSearchQuery={fileSearchQuery}
            setFileSearchQuery={setFileSearchQuery}
            dragOver={dragOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            user={user}
            fileInputRef={fileInputRef}
            uploading={uploading}
            showToast={showToast}
            handleFiles={handleFiles}
            deleteFile={deleteFile}
            generateDocumentation={generateDocumentation}
            copyToClipboard={copyToClipboard}
            exportDoc={exportDoc}
            generateDocFix={generateDocFix}
            deleteCurrentProject={deleteCurrentProject}
            handleCreateProjectBtnClick={handleCreateProjectBtnClick}
            docHealthScore={docHealthScore}
            docHealthSuggestions={docHealthSuggestions}
            healthLoading={healthLoading}
            setActiveTab={setActiveTab}
            setSelectedFileInspector={setSelectedFileInspector}
          />
        </>
      ) : (
        <SplashLandingPage
          onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onRegisterClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        />
      )}

      <AppModals
        showAuthModal={showAuthModal}
        showLogoutModal={showLogoutModal}
        showDeleteConfirmModal={showDeleteConfirmModal}
        showNewProjectModal={showNewProjectModal}
        showSettingsModal={showSettingsModal}
        showFixModal={showFixModal}
        selectedFileInspector={selectedFileInspector}
        authMode={authMode}
        authUsername={authUsername}
        authPassword={authPassword}
        showPassword={showPassword}
        authLoading={authLoading}
        settingsDisplayName={settingsDisplayName}
        settingsModel={settingsModel}
        settingsPassword={settingsPassword}
        settingsLoading={settingsLoading}
        newProjectName={newProjectName}
        newProjectDesc={newProjectDesc}
        projectTemplate={projectTemplate}
        fixingLoading={fixingLoading}
        docFixProposal={docFixProposal}
        selectedFixSuggestion={selectedFixSuggestion}
        currentProject={currentProject}
        user={user}
        setShowAuthModal={setShowAuthModal}
        setShowLogoutModal={setShowLogoutModal}
        confirmLogout={confirmLogout}
        setShowDeleteConfirmModal={setShowDeleteConfirmModal}
        confirmDeleteProject={confirmDeleteProject}
        createProject={createProject}
        handleAuth={handleAuth}
        setAuthMode={setAuthMode}
        setAuthUsername={setAuthUsername}
        setAuthPassword={setAuthPassword}
        setShowPassword={setShowPassword}
        setSettingsDisplayName={setSettingsDisplayName}
        setSettingsModel={setSettingsModel}
        setSettingsPassword={setSettingsPassword}
        setShowSettingsModal={setShowSettingsModal}
        handleUpdateProfile={handleUpdateProfile}
        setNewProjectName={setNewProjectName}
        setNewProjectDesc={setNewProjectDesc}
        setProjectTemplate={setProjectTemplate}
        setShowNewProjectModal={setShowNewProjectModal}
        copyDocFix={copyDocFix}
        deleteFile={deleteFile}
        setSelectedFileInspector={setSelectedFileInspector}
        setShowFixModal={setShowFixModal}
      />

      <ChatWidget
        showChatWidget={showChatWidget}
        setShowChatWidget={setShowChatWidget}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChatMessage={sendChatMessage}
        chatEndRef={chatEndRef}
        uploadedFiles={uploadedFiles}
      />
    </div>
  );
}
`;
writeFile(appPath, appNew);

console.log('Rebuilt frontend split components.');
