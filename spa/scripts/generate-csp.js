const fs = require("fs");
const crypto = require("crypto");

const html = fs.readFileSync("build/index.html", "utf8");

// Match inline <script>...</script>
debugger;
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
let match;
let hashes = [];

while ((match = scriptRegex.exec(html)) !== null) {
  const content = match[1].trim().replaceAll('\n','').replaceAll("<script>", "").replaceAll("</script>", "");
  if (content) {
    const hash = crypto.createHash("sha256").update(content).digest("base64");
    hashes.push(`'sha256-${hash}'`);
  }
}

// Build CSP string
const csp = `script-src 'self' ${hashes.join(" ")} https://www.google.com https://www.gstatic.com; frame-ancestors 'self' https://www.google.com;`;

fs.writeFileSync("build/csp-header.txt", csp);
console.log("✅ Generated CSP header:\n", csp);