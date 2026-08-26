import sys

filename = "frontend/public/department.html"

try:
    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"Error: {filename} not found.")
    sys.exit(1)

start_marker = "<!-- MOBILE FORM STYLES -->\n<style id=\"mobile-form-styles\">\n@media screen and (max-width: 768px) {"
end_marker = "}\n</style>"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start marker.")
    sys.exit(1)

# Find the end of the style block starting from start_idx
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Could not find end marker.")
    sys.exit(1)

# The block to modify
css_block = content[start_idx:end_idx + len(end_marker)]

# Replace "    form " with "    #loginForm "
# Replace "    form:" with "    #loginForm:"
new_css_block = css_block.replace("    form ", "    #loginForm ")
new_css_block = new_css_block.replace("    form:", "    #loginForm:")
new_css_block = new_css_block.replace("    form.", "    #loginForm.")

# Reconstruct the file content
new_content = content[:start_idx] + new_css_block + content[end_idx + len(end_marker):]

with open(filename, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully scoped mobile form styles to #loginForm.")
