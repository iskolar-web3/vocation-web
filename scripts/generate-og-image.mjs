import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const logoSvgBase64 = fs.readFileSync(path.join(publicDir, 'vocation-logo.svg'), 'base64');
const logoDataUri = `data:image/svg+xml;base64,${logoSvgBase64}`;

const ogHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      background: radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.22) 0%, transparent 50%),
                  radial-gradient(circle at 15% 85%, rgba(37, 99, 235, 0.25) 0%, transparent 45%),
                  linear-gradient(135deg, #021438 0%, #021F53 50%, #011336 100%);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 72px;
      overflow: hidden;
      position: relative;
    }

    /* Subtle grid overlay */
    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 10;
    }

    .logo-container {
      width: 72px;
      height: 72px;
      background: #ffffff;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2);
      padding: 6px;
    }

    .logo-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .brand-group {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .brand-name span {
      color: #60a5fa;
    }

    .brand-tag {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #93c5fd;
    }

    .badge-pill {
      margin-left: auto;
      background: rgba(96, 165, 250, 0.15);
      border: 1px solid rgba(147, 197, 253, 0.3);
      color: #bfdbfe;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .content {
      position: relative;
      z-index: 10;
      max-width: 950px;
      margin-top: 10px;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -1.5px;
      color: #ffffff;
      margin-bottom: 18px;
    }

    .hero-title .highlight {
      background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #facc15 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-desc {
      font-size: 22px;
      line-height: 1.45;
      color: #cbd5e1;
      font-weight: 400;
      max-width: 860px;
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }

    .feature-tags {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.14);
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      color: #e2e8f0;
    }

    .tag-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #38bdf8;
    }

    .domain {
      font-size: 17px;
      font-weight: 700;
      color: #93c5fd;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      <img src="${logoDataUri}" alt="iSkolar Vocation Logo" />
    </div>
    <div class="brand-group">
      <div class="brand-name">iSkolar <span>Vocation</span></div>
      <div class="brand-tag">Internship & Coaching Platform</div>
    </div>
    <div class="badge-pill">Philippines 🇵🇭</div>
  </div>

  <div class="content">
    <h1 class="hero-title">
      Launch Your Dream Career with <span class="highlight">Verified Internships</span> & Expert Mentors.
    </h1>
    <p class="hero-desc">
      Connecting Filipino students with top tech, design, and business OJT roles, 1-on-1 industry mock interviews, and personalized resume reviews.
    </p>
  </div>

  <div class="footer">
    <div class="feature-tags">
      <div class="tag">
        <div class="tag-dot"></div>
        <span>OJT Directory</span>
      </div>
      <div class="tag">
        <div class="tag-dot" style="background: #fbbf24;"></div>
        <span>1-on-1 Mentorship</span>
      </div>
      <div class="tag">
        <div class="tag-dot" style="background: #34d399;"></div>
        <span>Mock Interviews</span>
      </div>
      <div class="tag">
        <div class="tag-dot" style="background: #a78bfa;"></div>
        <span>Resume Reviews</span>
      </div>
    </div>
    <div class="domain">
      vocation.iskolar.ph
    </div>
  </div>
</body>
</html>`;

async function generate() {
  console.log('Launching headless browser with user vocation logo...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await page.setContent(ogHtml, { waitUntil: 'networkidle' });
  
  const outputPath = path.join(publicDir, 'og-image.png');
  await page.screenshot({
    path: outputPath,
    type: 'png',
  });

  await browser.close();
  console.log(`Generated og-image.png at: ${outputPath}`);

  // Also write SVG version with embedded logo data URI
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#021438"/>
      <stop offset="50%" stop-color="#021F53"/>
      <stop offset="100%" stop-color="#011336"/>
    </linearGradient>
    <radialGradient id="glow1" cx="85%" cy="15%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#021F53" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="15%" cy="85%" r="45%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#021F53" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#facc15"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>

  <!-- Brand Header -->
  <g transform="translate(72, 60)">
    <rect width="72" height="72" rx="20" fill="#ffffff" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.3))"/>
    <image x="8" y="8" width="56" height="56" xlink:href="${logoDataUri}" preserveAspectRatio="xMidYMid meet"/>
    
    <text x="94" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" fill="#ffffff">iSkolar <tspan fill="#60a5fa">Vocation</tspan></text>
    <text x="94" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" letter-spacing="1.5" fill="#93c5fd">INTERNSHIP &amp; COACHING PLATFORM</text>
  </g>

  <!-- Content -->
  <g transform="translate(72, 210)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800" fill="#ffffff">
      <tspan x="0" y="0">Launch Your Dream Career with</tspan>
      <tspan x="0" y="68" fill="url(#titleGrad)">Verified Internships</tspan>
      <tspan y="68" fill="#ffffff"> &amp; Expert Mentors.</tspan>
    </text>

    <text x="0" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#cbd5e1">
      Connecting Filipino students with top tech, design, and business OJT roles,
    </text>
    <text x="0" y="202" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#cbd5e1">
      1-on-1 industry mock interviews, and personalized resume reviews.
    </text>
  </g>

  <!-- Footer -->
  <line x1="72" y1="520" x2="1128" y2="520" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
  <g transform="translate(72, 550)">
    <!-- Tags -->
    <rect x="0" y="0" width="150" height="38" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="20" cy="19" r="4" fill="#38bdf8"/>
    <text x="32" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">OJT Directory</text>

    <rect x="162" y="0" width="180" height="38" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="182" cy="19" r="4" fill="#fbbf24"/>
    <text x="194" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">1-on-1 Mentorship</text>

    <rect x="354" y="0" width="165" height="38" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="374" cy="19" r="4" fill="#34d399"/>
    <text x="386" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Mock Interviews</text>

    <rect x="531" y="0" width="165" height="38" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>
    <circle cx="551" cy="19" r="4" fill="#a78bfa"/>
    <text x="563" y="24" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#e2e8f0">Resume Reviews</text>

    <text x="1056" y="24" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="18" font-weight="700" fill="#93c5fd">vocation.iskolar.ph</text>
  </g>
</svg>`;

  const svgOutputPath = path.join(publicDir, 'og-image.svg');
  fs.writeFileSync(svgOutputPath, svgContent, 'utf8');
  console.log(`Generated og-image.svg at: ${svgOutputPath}`);
}

generate().catch((err) => {
  console.error('Failed to generate og-image:', err);
  process.exit(1);
});
