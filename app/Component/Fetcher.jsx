/** @format */
"use client";

import React, { useState, useEffect } from "react";
import Popup from "./Popup";

const Fetcher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup immediately
    setIsLoading(false);
    setShowPopup(true);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        zIndex: "9999"
      }}>
        {/* Completely plain white screen with nothing on it */}
      </div>
    );
  }

  return (
    <div className="content-wrapper" style={{
      position: "relative",
      width: "100%",
      height: "100vh"
    }}>
      {/* Background iframe removed - now only showing popup */}
      {showPopup && (
        <Popup />
      )}
    </div>
  );
};

export default Fetcher;