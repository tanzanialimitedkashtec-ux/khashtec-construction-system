import sys

filename = "frontend/public/department.html"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"Error: {filename} not found.")
    sys.exit(1)

# Inject .login-box border-radius into mobile styles
target = "@media screen and (max-width: 768px) {\n    /* Different styles and layouts ONLY for Mobile UI */"
injection = "@media screen and (max-width: 768px) {\n    /* Different styles and layouts ONLY for Mobile UI */\n    .login-box {\n        border-radius: 6px !important;\n    }\n"

if target in content and ".login-box {" not in content[content.find(target):content.find("}", content.find(target)+50)]:
    content = content.replace(target, injection, 1)
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully added .login-box border radius.")
else:
    print("Target not found or already injected.")
