import sys

filename = "frontend/public/department.js"
with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

bad_start = "// ====== SOCKET.IO NOTIFICATION SYSTEM ======"
if bad_start in content:
    content = content[:content.find(bad_start)]

correct_script = """
// ====== SOCKET.IO NOTIFICATION SYSTEM ======
(function initSocketNotifications() {
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.onload = () => {
        if (typeof io !== 'undefined') {
            const socket = io();
            socket.on('user_logged_in', (data) => {
                showLoginToast(data.message, data.role);
            });
        }
    };
    document.head.appendChild(script);

    const style = document.createElement('style');
    style.textContent = `
        .login-toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }
        .login-toast {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border-left: 4px solid #3b82f6;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 15px;
            min-width: 300px;
            max-width: 400px;
            pointer-events: auto;
            transform: translateX(120%);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-family: 'Inter', system-ui, sans-serif;
        }
        .login-toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        .login-toast-icon {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .login-toast-content {
            flex-grow: 1;
        }
        .login-toast-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
            color: #f8fafc;
        }
        .login-toast-desc {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.4;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.className = 'login-toast-container';
    document.body.appendChild(container);

    window.showLoginToast = function(message, role) {
        const toast = document.createElement('div');
        toast.className = 'login-toast';
        
        let roleColor = '#3b82f6';
        if (role && role.toLowerCase().includes('admin')) roleColor = '#ef4444';
        else if (role && role.toLowerCase().includes('director')) roleColor = '#8b5cf6';
        else if (role && role.toLowerCase().includes('manager')) roleColor = '#10b981';

        toast.style.borderLeftColor = roleColor;
        
        toast.innerHTML = `
            <div class="login-toast-icon" style="color: ${roleColor}; background: ${roleColor}20;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="login-toast-content">
                <div class="login-toast-title">New Login</div>
                <div class="login-toast-desc">${message}</div>
            </div>
        `;

        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 500);
        }, 5000);
    };
})();
"""

content += correct_script

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)
