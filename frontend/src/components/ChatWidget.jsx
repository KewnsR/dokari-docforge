import React from 'react';
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
    <>
      {/* Floating Action Button (AI Chatbot) */}
      <button 
        type="button" 
        onClick={() => setShowChatWidget(!showChatWidget)} 
        className={`floating-chat-btn ${showChatWidget ? 'active' : ''}`}
        title="Chat with AI Companion"
      >
        <motion.div
          key={showChatWidget ? 'close' : 'sparkle'}
          initial={{ rotate: -90, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {showChatWidget ? (
            <i className="fa-solid fa-xmark"></i>
          ) : (
            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
              <i className="fa-solid fa-comments fs-4"></i>
              <i className="fa-solid fa-sparkles text-warning position-absolute" style={{ fontSize: '0.65rem', top: '-4px', right: '-4px', textShadow: '0 0 6px var(--warning)' }}></i>
            </div>
          )}
        </motion.div>
      </button>

      {/* Floating AI Chat Widget Drawer */}
      <AnimatePresence>
        {showChatWidget && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="floating-chat-widget"
          >
            <div className="chat-widget-header d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2 text-white">
                <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                  <i className="fa-solid fa-comment-dots fs-5 text-white"></i>
                  <i className="fa-solid fa-sparkles text-warning position-absolute" style={{ fontSize: '0.5rem', top: '-3px', right: '-3px' }}></i>
                </div>
                <div>
                  <h6 className="m-0 text-white">AI Companion</h6>
                  <span className="text-white-50">Ask about your code</span>
                </div>
              </div>
              <button onClick={() => setShowChatWidget(false)} className="btn-close-chat" title="Close chat">
                <i className="fa-solid fa-minus"></i>
              </button>
            </div>

            <div className="chat-widget-body">
              <div className="chat-widget-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-message-row d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div className={`chat-message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                      <div className="bubble-sender-name mb-1">
                        {msg.sender === 'user' ? 'You' : 'Dokari AI'}
                      </div>
                      <div className="bubble-text">{msg.text}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message-row d-flex justify-content-start">
                    <div className="chat-message-bubble bubble-ai">
                      <div className="bubble-sender-name mb-1">Dokari AI</div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm text-primary" style={{ width: '10px', height: '10px' }} role="status"></span>
                        <span className="fs-7 text-muted">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-widget-input-area">
                <form onSubmit={sendChatMessage}>
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={(e) => setChatInput(e.target.value)} 
                    placeholder={uploadedFiles.length === 0 ? "Upload code to chat..." : "Ask me anything..."}
                    disabled={chatLoading || uploadedFiles.length === 0}
                  />
                  <button type="submit" className="btn-chat-send" disabled={chatLoading || !chatInput.trim() || uploadedFiles.length === 0}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
