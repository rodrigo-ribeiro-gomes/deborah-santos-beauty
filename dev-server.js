const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = 3000;
const API_TARGET = "http://localhost:8080";

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function contentType(filePath) {
    return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function send(res, statusCode, body, headers = {}) {
    res.writeHead(statusCode, {
        "Access-Control-Allow-Origin": "*",
        ...headers
    });
    res.end(body);
}

function proxyApi(req, res) {
    const targetUrl = new URL(req.url, API_TARGET);
    const proxyReq = http.request(
        targetUrl,
        {
            method: req.method,
            headers: {
                ...req.headers,
                host: targetUrl.host,
                origin: API_TARGET
            }
        },
        (proxyRes) => {
            const chunks = [];
            proxyRes.on("data", (chunk) => chunks.push(chunk));
            proxyRes.on("end", () => {
                const body = Buffer.concat(chunks);
                const headers = { ...proxyRes.headers };
                delete headers["access-control-allow-origin"];
                send(res, proxyRes.statusCode || 502, body, headers);
            });
        }
    );

    proxyReq.on("error", (error) => {
        send(res, 502, JSON.stringify({ error: error.message }), {
            "Content-Type": "application/json; charset=utf-8"
        });
    });

    req.pipe(proxyReq);
}

function serveStatic(req, res) {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    let pathname = decodeURIComponent(requestUrl.pathname);
    if (pathname === "/") {
        pathname = "/admin-produtos.html";
    }

    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
        return send(res, 403, "Forbidden");
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            return send(res, 404, "Not found");
        }

        send(res, 200, data, {
            "Content-Type": contentType(filePath)
        });
    });
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith("/produtos")) {
        return proxyApi(req, res);
    }

    return serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
    console.log(`API proxied to ${API_TARGET}`);
});
