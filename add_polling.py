import sys
import re

filename = r"c:\Users\USER\Downloads\consultion system\frontend\public\department.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
    if (typeof io !== 'undefined') {
        const socket = io();
        socket.on('user_logged_in', (data) => {
            console.log("Socket event user_logged_in received:", data);
            showLoginToast(data.message, data.role);
        });
    } else {
        console.error("Socket.io not loaded!");
    }

    // Auto-update notification badge on page load if logged in
    setTimeout(() => {
        if (typeof startNotificationPolling === 'function') {
            startNotificationPolling();
        } else if (typeof updateNotificationBadge === 'function') {
            updateNotificationBadge();
        }
    }, 2000);
"""

content = content.replace("""
    if (typeof io !== 'undefined') {
        const socket = io();
        socket.on('user_logged_in', (data) => {
            console.log("Socket event user_logged_in received:", data);
            showLoginToast(data.message, data.role);
        });
    } else {
        console.error("Socket.io not loaded!");
    }
""", replacement)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Added auto-polling.")
