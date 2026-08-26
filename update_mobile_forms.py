import sys
import re

filename = "frontend/public/department.html"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"Error: {filename} not found.")
    sys.exit(1)

# Modify the mobile form styles block
if "<style id=\"mobile-form-styles\">" in content:
    # We want to change:
    # 1. form border-radius: 20px -> 2px
    # 2. form input padding: 14px 16px -> 8px 10px
    # 3. form input border-radius: 12px -> 2px
    # 4. form button padding: 16px -> 10px
    # 5. form button border-radius: 12px -> 2px
    
    # We can replace the exact strings we injected previously
    content = content.replace("border-radius: 20px !important;", "border-radius: 2px !important;")
    content = content.replace("border-radius: 12px !important;", "border-radius: 2px !important;")
    content = content.replace("padding: 14px 16px !important;", "padding: 8px 10px !important;")
    content = content.replace("padding: 16px !important;", "padding: 10px !important;")
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated mobile form styles.")
else:
    print("Could not find the mobile styles block.")
