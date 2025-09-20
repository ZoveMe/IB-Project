import React, { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:8080/api";

function App() {
  const [activeTab, setActiveTab] = useState('signTab');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [status, setStatus] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('');
  const [isSignLoading, setIsSignLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [lastSignature, setLastSignature] = useState('');
  const [lastFileName, setLastFileName] = useState('');

  // Check API connection on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sign`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "connection-test"
      });

      if (response.ok || response.status === 400) {
        setConnectionStatus('Connected');
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      setConnectionStatus('Disconnected');
    }
  };

  const displayMessage = (message, type, targetSetter = setStatus) => {
    targetSetter(message);

    // Auto-clear after timeout
    setTimeout(() => {
      targetSetter('');
    }, type === "success" ? 12000 : 12000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Signature copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Signature copied to clipboard!');
    }
  };

  const downloadSignature = (signature, fileName) => {
    const blob = new Blob([signature], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".signature.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSign = async () => {
    const fileInput = document.querySelector('input[name="fileInput"]');
    if (!fileInput || fileInput.files.length === 0) {
      displayMessage("Please select a file first!", "error");
      return;
    }

    const file = fileInput.files[0];
    setIsSignLoading(true);

    const reader = new FileReader();

    reader.onload = async function () {
      const fileContent = reader.result;

      try {
        const response = await fetch(`${API_BASE_URL}/sign`, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain"
          },
          body: fileContent
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Server error: " + response.status);
        }

        const signedDataBase64 = await response.text();

        // Store signature and filename for later use
        setLastSignature(signedDataBase64);
        setLastFileName(file.name);

        // Enhanced success message without automatic download
        displayMessage(
          `Document signed successfully! ✅\n\nFile: ${file.name}\n\nUse the buttons below to copy or download your signature.`,
          "success"
        );

      } catch (err) {
        displayMessage("Error signing document: " + err.message, "error");
      } finally {
        setIsSignLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleVerify = async () => {
    const fileInput = document.querySelector('input[name="verifyFileInput"]');
    const signatureInput = document.querySelector('textarea[name="signatureInput"]');

    if (!fileInput || fileInput.files.length === 0) {
      displayMessage("Please select a file to verify!", "error", setVerifyStatus);
      return;
    }

    if (!signatureInput || !signatureInput.value.trim()) {
      displayMessage("Please enter a signature!", "error", setVerifyStatus);
      return;
    }

    const file = fileInput.files[0];
    const signature = signatureInput.value.trim();
    setIsVerifyLoading(true);

    const reader = new FileReader();

    reader.onload = async function () {
      const fileContent = reader.result;

      try {
        const response = await fetch(`${API_BASE_URL}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            documentContent: fileContent,
            signature: signature
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          // Enhanced error message for server errors
          throw new Error(`Server error: ${errorText || response.status}. Please check if the signing server is running.`);
        }

        const isValid = await response.json();

        if (isValid) {
          displayMessage(
            `✅ Signature is VALID!\n\nFile: ${file.name}\n\nThe document is authentic and has not been tampered with.`,
            "success",
            setVerifyStatus
          );
        } else {
          displayMessage(
            `❌ Signature is INVALID!\n\nFile: ${file.name}\n\nThe document may have been modified, the signature is incorrect, or there's a key mismatch.`,
            "error",
            setVerifyStatus
          );
        }

      } catch (err) {
        // Enhanced error messages with better descriptions
        let errorMessage = "";
        if (err.message.includes("Server error")) {
          errorMessage = `Validity Error: Unable to verify document.\n\nPlease ensure the signature is sent within a correct format and that the correct document is selected.`;
        } else if (err.message.includes("Failed to fetch")) {
          errorMessage = `Network Error: Cannot connect to signing server.\n\nPlease check your connection and server status.`;
        } else {
          errorMessage = `Verification Error: ${err.message}`;
        }

        displayMessage(errorMessage, "error", setVerifyStatus);
      } finally {
        setIsVerifyLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const openTab = (tabName) => {
    setActiveTab(tabName);
  };

  // Helper function to get message styling classes
  const getMessageClass = (message, isSuccess) => {
    if (!message) return '';
    // Check for INVALID first to avoid matching "VALID!" in "INVALID!"
    if (message.includes('INVALID!') || message.includes('Error') || message.includes('error')) {
      return 'error-message';
    }
    if (isSuccess || message.includes('successfully') || message.includes('✅ Signature is VALID!')) {
      return 'success-message';
    }
    return 'error-message'; // Default to error for safety
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="logo">
          Signing Server
        </div>
        <div className={`status-indicator ${connectionStatus === 'Connected' ? 'status-connected' : 'status-disconnected'}`}>
          {connectionStatus}
        </div>
      </nav>

      {/* Main Content */}
      <main className="simple-page">
        <h1>Document Signing System</h1>

        {/* Tabs */}
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'signTab' ? 'active' : ''}`}
            onClick={() => openTab('signTab')}
          >
            Sign Document
          </div>
          <div
            className={`tab ${activeTab === 'verifyTab' ? 'active' : ''}`}
            onClick={() => openTab('verifyTab')}
          >
            Verify Signature
          </div>
        </div>

        {/* Sign Tab Content */}
        {activeTab === 'signTab' && (
          <div className="tab-content active" id="signTab">
            <h2>Upload a Document for Signing</h2>
            <div id="uploadForm">
              <div className="form-group">
                <label htmlFor="fileInput">Select Document to Sign:</label>
                <input
                  type="file"
                  name="fileInput"
                  id="fileInput"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleSign}
                disabled={isSignLoading}
              >
                {isSignLoading ? 'Signing...' : 'Upload & Sign'}
              </button>
            </div>

            {/* Status Message */}
            <div
              id="status"
              className={getMessageClass(status, status.includes('successfully'))}
              style={{
                display: status ? 'block' : 'none'
              }}
            >
              {status}

              {/* Signature Actions - only show when we have a successful signature */}
              {status.includes('successfully') && lastSignature && (
                <div style={{ marginTop: '15px' }}>
                  <div className="signature-display">
                    {lastSignature}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(lastSignature)}
                    >
                      📋 Copy Signature
                    </button>
                    <button
                      className="copy-btn"
                      onClick={() => downloadSignature(lastSignature, lastFileName)}
                    >
                      💾 Download Signature
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verify Tab Content */}
        {activeTab === 'verifyTab' && (
          <div className="tab-content active" id="verifyTab">
            <h2>Verify Document Signature</h2>
            <div id="verifyForm">
              <div className="form-group">
                <label htmlFor="verifyFileInput">Select Original Document:</label>
                <input
                  type="file"
                  name="verifyFileInput"
                  id="verifyFileInput"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signatureInput">Paste Signature:</label>
                <textarea
                  name="signatureInput"
                  id="signatureInput"
                  placeholder="Paste the signature here..."
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifyLoading}
              >
                {isVerifyLoading ? 'Verifying...' : 'Verify Signature'}
              </button>
            </div>

            {/* Verify Status Message */}
            <div
              id="verifyStatus"
              className={getMessageClass(verifyStatus, verifyStatus.includes('VALID!'))}
              style={{
                display: verifyStatus ? 'block' : 'none'
              }}
            >
              {verifyStatus}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <p>Created by Slobodanka Pishtolova & Damjan Mitrovski</p>
      </footer>
    </div>
  );
}

export default App;