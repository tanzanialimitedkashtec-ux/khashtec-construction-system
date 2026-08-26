const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'backend');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Fix the broken replacement from the python script
    content = content.replace(/if \(\/\^\[a-zA-Z0-9_\]\+\$\/\.test\((.*?)\)\) \{\s*([a-zA-Z0-9_]+)\.push\(`\\`\$key\\`\$ = \?`\);\s*([a-zA-Z0-9_]+)\.push\((.*?)\);\s*\}\s*\}/g, 
        (match, keyVar, arr1, arr2, val) => {
            return `if (/^[a-zA-Z0-9_]+$/.test(${keyVar})) {\n                ${arr1}.push(\`\\\`\$\{${keyVar}\}\\\` = ?\`);\n                ${arr2}.push(${val});\n            }\n        }`;
        });

    // Also look for untouched dynamic updates:
    // Object.keys(updateData).forEach(key => {
    //     updateFields.push(`${key} = ?`);
    //     updateValues.push(updateData[key]);
    // });
    content = content.replace(/(Object\.keys\(\s*([a-zA-Z0-9_]+)\s*\)\.forEach\(\s*([a-zA-Z0-9_]+)\s*=>\s*\{\s*)([a-zA-Z0-9_]+)\.push\(`\$\{\s*\3\s*\}(\s*=\s*\?)`\);\s*([a-zA-Z0-9_]+)\.push\(\s*\2\[\3\]\s*\);\s*\}\);/g,
        (match, prefix, objName, keyName, fieldsArr, eqQm, valuesArr) => {
            return `${prefix}if (/^[a-zA-Z0-9_]+$/.test(${keyName})) {\n                ${fieldsArr}.push(\`\\\`\$\{${keyName}\}\\\`${eqQm}\`);\n                ${valuesArr}.push(${objName}[${keyName}]);\n            }\n        });`;
        });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            fixFile(fullPath);
        }
    });
}

walkDir(directory);
