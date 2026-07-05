import sys
import re

filename = r"c:\Users\USER\Downloads\consultion system\frontend\public\department.html"

with open(filename, "r", encoding="utf-8") as f:
    content = f.read()

# Make replacements
content = content.replace(
    ".login-toast-container {\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        z-index: 999999;\n        display: flex;\n        flex-direction: column;\n        gap: 10px;",
    ".login-toast-container {\n        position: fixed;\n        top: 16px;\n        right: 16px;\n        z-index: 999999;\n        display: flex;\n        flex-direction: column;\n        gap: 8px;"
)

content = content.replace(
    ".login-toast {\n        background: rgba(15, 23, 42, 0.95);\n        backdrop-filter: blur(10px);\n        border-left: 4px solid #3b82f6;\n        color: white;\n        padding: 16px 20px;\n        border-radius: 8px;\n        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);\n        display: flex;\n        align-items: center;\n        gap: 15px;\n        min-width: 300px;\n        max-width: 400px;",
    ".login-toast {\n        background: rgba(15, 23, 42, 0.95);\n        backdrop-filter: blur(12px);\n        border-left: 3px solid #3b82f6;\n        color: white;\n        padding: 8px 12px;\n        border-radius: 8px;\n        box-shadow: 0 6px 20px -4px rgba(0,0,0,0.4), 0 0 10px rgba(59,130,246,0.2);\n        display: flex;\n        align-items: center;\n        gap: 10px;\n        min-width: 240px;\n        max-width: 320px;"
)

content = content.replace(
    ".login-toast-icon {\n        background: rgba(59, 130, 246, 0.2);\n        color: #60a5fa;\n        width: 40px;\n        height: 40px;\n        border-radius: 50%;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 20px;",
    ".login-toast-icon {\n        background: rgba(59, 130, 246, 0.2);\n        color: #60a5fa;\n        width: 28px;\n        height: 28px;\n        border-radius: 6px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-size: 14px;"
)

content = content.replace(
    ".login-toast-title {\n        font-weight: 600;\n        font-size: 14px;\n        margin-bottom: 4px;\n        color: #f8fafc;\n    }",
    ".login-toast-title {\n        font-weight: 600;\n        font-size: 11.5px;\n        margin-bottom: 2px;\n        color: #f8fafc;\n    }"
)

content = content.replace(
    ".login-toast-desc {\n        font-size: 13px;\n        color: #94a3b8;\n        line-height: 1.4;\n    }",
    ".login-toast-desc {\n        font-size: 10.5px;\n        color: #94a3b8;\n        line-height: 1.35;\n    }"
)

# Shrink SVG inside the script
content = content.replace(
    '<svg width="24" height="24"',
    '<svg width="16" height="16"'
)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced successfully.")
