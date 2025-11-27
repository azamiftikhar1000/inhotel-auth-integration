// Load environment variables from .env file
require('dotenv').config();

// server.js
const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { processBase64DataAndFetchTools, processSecretAndFetchTools, extractSecretFromBase64Data } = require("./utils/assistantService");
let compression;
try {
  compression = require('compression');
} catch (e) {
  compression = null;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable gzip compression if available
if (compression) {
  app.use(compression());
} else {
  console.warn('compression package not installed; static responses will not be gzipped.');
}

// New API endpoints for assistant lookup and tools fetching
app.post('/api/assistant/lookup', async (req, res) => {
  try {
    const { base64Data, secret, options = {} } = req.body;
    
    let result;
    if (base64Data) {
      // Process base64 data to extract secret and fetch tools
      result = await processBase64DataAndFetchTools(base64Data, options);
    } else if (secret) {
      // Process secret directly to fetch tools
      result = await processSecretAndFetchTools(secret, options);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either base64Data or secret must be provided'
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in assistant lookup endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.post('/api/assistant/extract-secret', async (req, res) => {
  try {
    const { base64Data } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({
        success: false,
        error: 'base64Data is required'
      });
    }
    
    const secret = extractSecretFromBase64Data(base64Data);
    
    res.json({
      success: true,
      secret: secret,
      has_secret: !!secret
    });
  } catch (error) {
    console.error('Error in extract secret endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'authkit-picaos'
  });
});

app.use(
  ["/public/v1", "/v1/public"],
  createProxyMiddleware({
    target: "https://platform-backend.inhotel.io",
    changeOrigin: true,
  })
);

// serve your webpack build with long cache headers
app.use(express.static(path.join(__dirname, "dist"), {
  setHeaders: (res, filePath) => {
    if (/\.(js|css|png|jpg|jpeg|gif|svg|webp)$/.test(filePath)) {
      // cache hashed assets aggressively
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Assistant lookup: POST http://localhost:${PORT}/api/assistant/lookup`);
  console.log(`🔑 Extract secret: POST http://localhost:${PORT}/api/assistant/extract-secret`);
});
