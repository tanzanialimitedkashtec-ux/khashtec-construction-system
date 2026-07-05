with open('frontend/public/department.js', 'rb') as f:
    content = f.read()

# Replace the problematic back button call in both encoded and plain forms
content = content.replace(
    b'onclick="loadEmployeeList()">',
    b'onclick="viewEmployeeList()">'
)

with open('frontend/public/department.js', 'wb') as f:
    f.write(content)

print("Done. Verifying...")
with open('frontend/public/department.js', 'r', encoding='utf-8', errors='ignore') as f:
    for i, line in enumerate(f, 1):
        if 'viewEmployeeList()' in line and 'Back' in line:
            print(f"Line {i}: {line.strip()}")
