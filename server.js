// server.js
const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  ["/public/v1", "/v1/public"],
  createProxyMiddleware({
    target: "https://platform-backend.inhotel.io",
    changeOrigin: true,
  })
);
// serve your webpack build
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
