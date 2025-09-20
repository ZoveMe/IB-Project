const API_BASE_URL = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {
    // Check API connection on page load
    checkApiConnection();

    // Set up event listeners
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", sign);
    }

    const verifyForm = document.getElementById("verifyForm");
    if (verifyForm) {
        verifyForm.addEventListener("submit", verify);
    }
});

// Check API connection status
async function checkApiConnection() {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;

    try {
        const response = await fetch(`${API_BASE_URL}/sign`, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: "connection-test"
        });

        if (response.ok || response.status === 400) {
            statusEl.textContent = 'Connected';
            statusEl.className = 'status-indicator status-connected';
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        statusEl.textContent = 'Disconnected';
        statusEl.className = 'status-indicator status-disconnected';
    }
}

// Document signing function (enhanced version of your existing code)
async function sign(event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        displayMessage("Please select a file first!", "error");
        return;
    }

    const file = fileInput.files[0];
    const signBtn = document.getElementById("signBtn") || event.target.querySelector('button[type="submit"]');

    // Show loading state
    const originalBtnText = signBtn.innerHTML;
    signBtn.disabled = true;
    signBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing...';

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

            // Enhanced success message with signature display
            displayMessage(
                `Document signed successfully! ✅<br><br>
                <strong>File:</strong> ${file.name}<br><br>
                <strong>Signature:</strong>
                <div class="signature-display">${signedDataBase64}</div>
                <button class="copy-btn" onclick="copyToClipboard('${signedDataBase64}')">Copy Signature</button>`,
                "success"
            );

            // Download signature file
            downloadSignature(signedDataBase64, file.name);

        } catch (err) {
            displayMessage("Error signing document: " + err.message, "error");
        } finally {
            // Restore button state
            signBtn.disabled = false;
            signBtn.innerHTML = originalBtnText;
        }
    };

    reader.readAsText(file);
}

// Document verification function (new)
async function verify(event) {
    event.preventDefault();

    const fileInput = document.getElementById("verifyFileInput");
    const signatureInput = document.getElementById("signatureInput");
    const verifyBtn = document.getElementById("verifyBtn") || event.target.querySelector('button[type="submit"]');

    if (fileInput.files.length === 0) {
        displayMessage("Please select a file to verify!", "error", "verifyStatus");
        return;
    }

    if (!signatureInput.value.trim()) {
        displayMessage("Please enter a signature!", "error", "verifyStatus");
        return;
    }

    const file = fileInput.files[0];
    const signature = signatureInput.value.trim();

    // Show loading state
    const originalBtnText = verifyBtn.innerHTML;
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

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
                throw new Error(errorText || "Server error: " + response.status);
            }

            const isValid = await response.json();

            if (isValid) {
                displayMessage(
                    `✅ Signature is VALID!<br><br>
                    File: ${file.name}<br><br>
                    The document is authentic and has not been tampered with.`,
                    "success",
                    "verifyStatus"
                );
            } else {
                displayMessage(
                    `❌ Signature is INVALID!<br><br>
                    File: ${file.name}<br><br>
                    The document may have been modified or the signature is incorrect.`,
                    "error",
                    "verifyStatus"
                );
            }

        } catch (err) {
            displayMessage(
                `Error verifying document: ${err.message}`,
                "error",
                "verifyStatus"
            );
        } finally {
            // Restore button state
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = originalBtnText;
        }
    };

    reader.readAsText(file);
}

// Enhanced displayMessage function (works with your existing #status structure)
function displayMessage(message, type, targetElementId = null) {
    // Use your existing status element by default
    let statusElement;
    if (targetElementId) {
        statusElement = document.getElementById(targetElementId);
    } else {
        statusElement = document.getElementById("status");
    }

    if (!statusElement) {
        // Fallback: create message element like your original approach
        const messageElement = document.createElement("div");
        messageElement.innerHTML = message;
        messageElement.style.padding = "10px";
        messageElement.style.marginTop = "20px";
        messageElement.style.borderRadius = "5px";
        messageElement.style.textAlign = "center";
        messageElement.style.color = "white";
        messageElement.style.backgroundColor = type === "success" ? "green" : "red";

        const form = document.getElementById("uploadForm");
        if (form) {
            form.appendChild(messageElement);
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
        return;
    }

    // Use your existing status paragraph structure
    statusElement.innerHTML = message;
    statusElement.style.padding = "10px";
    statusElement.style.borderRadius = "5px";
    statusElement.style.textAlign = "center";
    statusElement.style.marginTop = "10px";

    if (type === "success") {
        statusElement.style.backgroundColor = "green";
        statusElement.style.color = "white";
    } else {
        statusElement.style.backgroundColor = "red";
        statusElement.style.color = "white";
    }

    // Auto-clear after timeout (like your original)
    setTimeout(() => {
        statusElement.innerHTML = "";
        statusElement.style.backgroundColor = "";
        statusElement.style.color = "";
        statusElement.style.padding = "";
    }, type === "success" ? 8000 : 5000);
}

// Tab functionality
function openTab(evt, tabName) {
    var tabcontent = document.getElementsByClassName("tab-content");
    var tablinks = document.getElementsByClassName("tab");

    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary feedback
        const button = event.target;
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#155724';

        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = '#28a745';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        alert('Signature copied to clipboard!');
    });
}

function downloadSignature(signature, fileName) {
    const blob = new Blob([signature], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + ".signature.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
