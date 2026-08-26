const fs = require('fs');
const { execSync } = require('child_process');

let lines = fs.readFileSync('frontend/public/department.js', 'utf8').split('\n');
let modified = false;

while (true) {
    try {
        fs.writeFileSync('frontend/public/department.js', lines.join('\n'), 'utf8');
        execSync('node -c frontend/public/department.js', { stdio: 'pipe' });
        console.log('No more syntax errors!');
        break;
    } catch (e) {
        const errStr = e.stderr.toString();
        const match = errStr.match(/department\.js:(\d+)/);
        if (match) {
            const lineNum = parseInt(match[1]);
            if (errStr.includes('missing ) after argument list')) {
                // Remove lineNum - 2 (since it's 1-indexed, it is lineNum - 3 in 0-indexed, let's verify)
                const targetIdx = lineNum - 3;
                if (lines[targetIdx].trim() === '}') {
                    lines.splice(targetIdx, 1);
                    console.log('Fixed error at', lineNum, 'removed index', targetIdx);
                    modified = true;
                } else if (lines[lineNum - 2].trim() === '}') {
                    lines.splice(lineNum - 2, 1);
                    console.log('Fixed error at', lineNum, 'removed index', lineNum - 2);
                    modified = true;
                } else {
                    console.error('Could not find } at line', lineNum);
                    console.error('Lines around:', lines.slice(lineNum - 4, lineNum + 1).join('\n'));
                    break;
                }
            } else {
                console.error('Different error:', errStr);
                break;
            }
        } else {
            console.error('Could not parse error:', errStr);
            break;
        }
    }
}
