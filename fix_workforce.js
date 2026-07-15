const fs = require('fs');

// Fix department.html
let html = fs.readFileSync('./frontend/public/department.html', 'utf8');

const htmlOld = `                        \${request.status === 'pending' ? \`<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">✅</button>
                        <button class="action-btn reject" onclick="rejectWorkforceRequest('\${request.id}')" title="Reject">🚫</button>\` : ''}`;

const htmlNew = `                        \${(currentRole !== 'PROJECT' && request.status === 'pending') ? \`<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">✅</button>
                        <button class="action-btn reject" onclick="rejectWorkforceRequest('\${request.id}')" title="Reject">🚫</button>\` : ''}`;

if (html.includes(htmlOld)) {
    html = html.replace(htmlOld, htmlNew);
    fs.writeFileSync('./frontend/public/department.html', html, 'utf8');
    console.log('department.html updated successfully.');
} else {
    console.log('Could not find target in department.html.');
}

// Fix department.js
let js = fs.readFileSync('./frontend/public/department.js', 'utf8');

// In department.js there's only the approve button (no reject), wrap it with role check
const jsOld = `                    <div class="request-actions">\r\n\r\n                        <button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">`;
const jsNew = `                    <div class="request-actions">\r\n\r\n                        \${currentRole !== 'PROJECT' ? \`<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">`;

if (js.includes(jsOld)) {
    // Also need to close the ternary after the button
    const jsOldFull = `<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">\u00E2\u009C\u0085</button>`;
    const jsNewFull = `<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">\u00E2\u009C\u0085</button>\` : ''}`;
    js = js.replace(jsOldFull, jsNewFull);
    js = js.replace(`                    <div class="request-actions">\r\n\r\n                        <button`, `                    <div class="request-actions">\r\n\r\n                        \${currentRole !== 'PROJECT' ? \`<button`);
    fs.writeFileSync('./frontend/public/department.js', js, 'utf8');
    console.log('department.js updated successfully.');
} else {
    console.log('Could not find target in department.js, trying alternate approach...');
    
    // Try without \r\n
    const jsApproveBtn = `<button class="action-btn approve" onclick="approveWorkforceRequest('\${request.id}')" title="Approve">`;
    if (js.includes(jsApproveBtn)) {
        // Find the exact line and wrap it
        const idx = js.indexOf(jsApproveBtn);
        // Find the closing </button> after this
        const closeIdx = js.indexOf('</button>', idx);
        const fullBtn = js.substring(idx, closeIdx + '</button>'.length);
        const wrapped = `\${currentRole !== 'PROJECT' ? \`${fullBtn}\` : ''}`;
        js = js.replace(fullBtn, wrapped);
        fs.writeFileSync('./frontend/public/department.js', js, 'utf8');
        console.log('department.js updated (alternate approach).');
    } else {
        console.log('Could not find approve button in department.js at all.');
    }
}
