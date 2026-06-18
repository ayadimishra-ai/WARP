import { useState, useEffect } from "react";
import React from "react";

const ToManyRequestMessage = ({
  message,
  enableAutoClear = true,
  autoClearTime = 60000,
  onClear, // callback to parent
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (enableAutoClear) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClear) onClear(); // notify parent to clear message
      }, autoClearTime);
      return () => clearTimeout(timer);
    }
  }, [enableAutoClear, autoClearTime, onClear]);

  if (!visible) return null;

  return (
    <div className="max-request-error">
      {message}
    </div>
  );
};

export default ToManyRequestMessage;