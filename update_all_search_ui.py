import sys
import re

filename = "frontend/public/department.html"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"Error: {filename} not found.")
    sys.exit(1)

# Replace the buttons
old_button_style = 'style="padding: 10px 20px; background: #6c757d; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"'
new_button_style = 'style="padding: 8px 16px; background: #6c757d; color: #fff; border: 1px solid #6c757d; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; box-sizing: border-box; height: 38px;"'

button_count = content.count(old_button_style)
content = content.replace(old_button_style, new_button_style)

# Replace the inputs
# They usually look like: style="padding: 10px 15px; border: 1px solid #ddd; border-radius: 6px; flex: 1; font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"
# Sometimes with " min-width: 250px;" inside.
# We'll use a regex to capture anything between "flex: 1;" and "font-size: 14px;"
input_regex = r'style="padding: 10px 15px; border: 1px solid #ddd; border-radius: 6px; flex: 1;(.*?) font-size: 14px; box-shadow: 0 1px 3px rgba\(0,0,0,0\.1\);"'
input_replacement = r'style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; flex: 1;\1 font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); box-sizing: border-box; height: 38px;"'

input_matches = len(re.findall(input_regex, content))
content = re.sub(input_regex, input_replacement, content)

with open(filename, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Successfully updated {button_count} buttons and {input_matches} inputs.")
