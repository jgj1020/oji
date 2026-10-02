"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="oji-splash" aria-hidden="true">
      <div className="oji-splash-glow" />

      <img
        src="/icon-512.png"
        alt=""
        className="oji-splash-logo"
      />

      <div className="oji-splash-spark spark-one" />
      <div className="oji-splash-spark spark-two" />
    </div>
  );
}
