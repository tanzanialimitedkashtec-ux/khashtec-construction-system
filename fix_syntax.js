const fs = require('fs');
let content = fs.readFileSync('frontend/public/department.js', 'utf8');

// Replace the specific extra closing brace pattern
content = content.replace(/            \}\);\r?\n            \}\r?\n\r?\n        \}\r?\n\r?\n    \}, 100\);/g, '            });\n        }\n\n    }, 100);');

fs.writeFileSync('frontend/public/department.js', content, 'utf8');
console.log('Fixed extra braces.');
