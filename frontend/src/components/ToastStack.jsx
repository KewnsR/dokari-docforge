import React, { useEffect, useState } from 'react';

function ToastStack({ toasts }) {
  return (
    <div className="toast-wrapper">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast.duration) return;
    const intervalTime = 50;
    const steps = toast.duration / intervalTime;
    const decrement = 100 / steps;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration]);

  return (
    <div 
      className={`toast-item toast-${toast.type}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 14px'
      }}
    >
      <div className="d-flex align-items-center justify-content-between gap-3 w-100">
        <span className="fs-7.5 fw-semibold">{toast.message}</span>
        {toast.action && (
          <button 
            type="button"
            onClick={toast.action} 
            className="btn btn-primary btn-sm py-0.5 px-2 fw-bold text-uppercase fs-8 d-flex align-items-center gap-1"
            style={{ 
              borderRadius: '4px', 
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              lineHeight: 1.5,
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fa-solid fa-arrow-rotate-left"></i>Undo
          </button>
        )}
      </div>
      {toast.duration && (
        <div className="toast-progress-bar rounded-pill" style={{ height: '3px', background: 'rgba(255,255,255,0.12)', overflow: 'hidden', width: '100%' }}>
          <div 
            className="toast-progress-fill h-100" 
            style={{ 
              width: `${progress}%`, 
              backgroundColor: 'rgba(255,255,255,0.6)',
              transition: 'width 0.05s linear'
            }} 
          />
        </div>
      )}
    </div>
  );
}

export default ToastStack;
