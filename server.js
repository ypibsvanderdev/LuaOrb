const http = require('http');
const fs = require('fs');
const path = require('path');

const accessDeniedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SUSHIX PROTECT | ACCESS RESTRICTED</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: 'Fira Code', monospace; color: #fff; background-image: radial-gradient(circle at 50% 50%, #1a0505 0%, #000 100%); }
        .danger-box { text-align: center; }
        .fas.fa-biohazard { color: #ff3366; font-size: 80px; margin-bottom: 20px; text-shadow: 0 0 30px rgba(255, 51, 102, 0.6); animation: pulseDanger 2s infinite; }
        h1 { font-size: 48px; letter-spacing: 5px; color: #ff3366; margin: 0; text-transform: uppercase; }
        p.subtitle { color: #ff88a0; margin-top: 15px; font-size: 16px; }
        .details { margin-top: 40px; background: rgba(255, 51, 102, 0.05); border: 1px solid #ff3366; padding: 24px; border-radius: 12px; max-width: 600px; text-align: left; display: inline-block; width: 100%; box-sizing: border-box; }
        .details p { margin: 0 0 10px 0; color: #ff88a0; font-size: 14px; }
        .details span { color: #fff; }
        .log-msg { margin-top: 20px; font-size: 12px; color: #ff3366; }
        @keyframes pulseDanger { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
    </style>
</head>
<body>
    <div class="danger-box">
        <i class="fas fa-biohazard"></i>
        <h1>ACCESS RESTRICTED</h1>
        <p class="subtitle">TITAN FIREWALL HAS BLOCKED CONNECTION TO THE SUSHIX VAULT</p>
        <div class="details">
            <p>> Analyzing Target Asset...</p>
            <p>> Origin Node: <span id="ua-text">Resolving...</span></p>
            <p>> Violation Details: <span>Invalid Execution Handshake (Direct URI Browser Access)</span></p>
            <div class="log-msg"><i class="fas fa-exclamation-triangle"></i> DUMP ATTEMPT LOGGED INCIDENT RECORDED</div>
        </div>
    </div>
    <script>
        document.getElementById('ua-text').innerText = navigator.userAgent;
    </script>
</body>
</html>
`;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];

    // Loadstring URLs handler
    if (urlPath.startsWith('/raw/')) {
        const ua = (req.headers['user-agent'] || '').toLowerCase();
        const isRoblox = ua.includes('roblox') || ua.includes('wininet');

        // Serve the brutal Access Denied page if it's a browser request
        if (!isRoblox) {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end(accessDeniedHtml);
            return;
        }

        // Serve the real script payload if it's Roblox
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('-- [ SUSHIX-SECURE VAULT ]\nprint("Successfully Executed from SushiX Cloud Vault!")\n');
        return;
    }

    // Basic Static Server for Dashboard
    if (urlPath === '/' || urlPath === '/index.html') urlPath = '/index.html';

    const extname = String(path.extname(urlPath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    const filePath = path.join(__dirname, urlPath);
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('Resource Not Found\\n');
            } else {
                res.writeHead(500);
                res.end('Server Error\\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(4444, () => {
    console.log('SushiX Protection Server Initialized at http://127.0.0.1:4444/');
});
