import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteProgressBar() {
  const location = useLocation();
  const [animKey, setAnimKey] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    setAnimKey(k => k + 1);

    // Hide after animation completes (fill 0.9s + fade 0.35s = ~1.3s)
    const t = setTimeout(() => setShow(false), 1300);
    return () => clearTimeout(t);
  }, [location.key]);

  if (!show) return null;

  return (
    <div className="route-progress-track" aria-hidden="true">
      <div key={animKey} className="route-progress-bar" />
    </div>
  );
}
