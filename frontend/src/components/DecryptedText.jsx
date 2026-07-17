import React, { useEffect, useState } from 'react';

function DecryptedText({ text, interval = 25, delay = 0, hoverTrigger = false }) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-";

  const runAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let iteration = 0;
    
    const timer = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(timer);
        setIsAnimating(false);
      }
      
      iteration += 1;
    }, interval);
  };

  useEffect(() => {
    if (hoverTrigger) return;
    const timeout = setTimeout(() => {
      runAnimation();
    }, delay);
    return () => clearTimeout(timeout);
  }, [text]);

  const handleMouseEnter = () => {
    if (hoverTrigger) {
      runAnimation();
    }
  };

  return (
    <span onMouseEnter={handleMouseEnter} style={{ display: 'inline-block' }}>
      {displayText}
    </span>
  );
}

export default DecryptedText;
