#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Build script for Smart Tiffin Box Dashboard
console.log('🚀 Building Smart Tiffin Box Dashboard for deployment...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create subdirectories
['css', 'js', 'assets'].forEach(dir => {
    const fullPath = path.join(distDir, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

// Copy and process HTML
console.log('📄 Processing HTML...');
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Add production optimizations
html = html.replace(
    '<script src="js/script.js"></script>',
    '<script src="js/script.js?v=' + Date.now() + '"></script>'
);

html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    '<link rel="stylesheet" href="css/style.css?v=' + Date.now() + '">'
);

// Add meta tags for production
const metaTags = `
    <meta name="description" content="Smart Tiffin Box - Real-time IoT monitoring system for ESP32-based food warming devices">
    <meta name="keywords" content="IoT, ESP32, Smart Tiffin, Food Monitoring, Dashboard, Real-time">
    <meta name="author" content="Smart Tiffin Box Team">
    <meta property="og:title" content="Smart Tiffin Box Dashboard">
    <meta property="og:description" content="Modern IoT dashboard for Smart Tiffin Box monitoring">
    <meta property="og:type" content="website">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="theme-color" content="#0a0e27">
`;

html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">' + metaTags);

fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Copy and minify CSS
console.log('🎨 Processing CSS...');
let css = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');

// Add production optimizations
const productionCSS = `
/* Production Build - Smart Tiffin Box Dashboard */
/* Build Date: ${new Date().toISOString()} */
/* Version: 1.0.0 */

${css}

/* Production optimizations */
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

input, textarea {
    -webkit-user-select: text;
    -khtml-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
}

/* Loading optimization */
.loading-screen {
    will-change: opacity;
}

.card {
    will-change: transform;
}

/* Performance optimizations */
.dashboard {
    contain: layout style paint;
}

.activity-feed {
    contain: layout style paint;
}
`;

fs.writeFileSync(path.join(distDir, 'css', 'style.css'), productionCSS);

// Copy and process JavaScript
console.log('⚡ Processing JavaScript...');
let js = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');

// Add production optimizations
const productionJS = `
// Production Build - Smart Tiffin Box Dashboard
// Build Date: ${new Date().toISOString()}
// Version: 1.0.0

// Production optimizations
(function() {
    'use strict';
    
    // Disable console logs in production
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log = function() {};
        console.warn = function() {};
        console.error = function() {};
    }
    
    // Preload critical resources
    function preloadResources() {
        const resources = [
            'css/style.css',
            'js/script.js'
        ];
        
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
    
    // Initialize preloading
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadResources);
    } else {
        preloadResources();
    }
})();

${js}

// Production error handling
window.addEventListener('error', function(e) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Log errors to service in production
        console.error('Production Error:', e.error);
    }
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
`;

fs.writeFileSync(path.join(distDir, 'js', 'script.js'), productionJS);

// Create service worker for PWA
console.log('📱 Creating Service Worker...');
const serviceWorker = `
// Smart Tiffin Box Dashboard Service Worker
const CACHE_NAME = 'smart-tiffin-box-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/assets/favicon.ico'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
`;

fs.writeFileSync(path.join(distDir, 'sw.js'), serviceWorker);

// Copy assets
console.log('📁 Copying assets...');
const assetsDir = path.join(__dirname, 'assets');
const distAssetsDir = path.join(distDir, 'assets');

if (fs.existsSync(assetsDir)) {
    fs.readdirSync(assetsDir).forEach(file => {
        fs.copyFileSync(
            path.join(assetsDir, file),
            path.join(distAssetsDir, file)
        );
    });
}

// Create favicon if not exists
const faviconPath = path.join(distAssetsDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
    // Create a simple favicon placeholder
    const svgFavicon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" fill="#0a0e27"/>
    <text x="16" y="22" font-family="Arial" font-size="20" fill="#00d4ff" text-anchor="middle">🍱</text>
</svg>`;
    fs.writeFileSync(path.join(distDir, 'favicon.svg'), svgFavicon);
}

// Create deployment configuration files
console.log('⚙️ Creating deployment configurations...');

// Netlify configuration
const netlifyConfig = `[build]
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "14"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404
`;

fs.writeFileSync(path.join(__dirname, 'netlify.toml'), netlifyConfig);

// Vercel configuration
const vercelConfig = {
  "version": 2,
  "builds": [
    {
      "src": "dist/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
};

fs.writeFileSync(path.join(__dirname, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));

// GitHub Pages deployment script
const deployScript = `#!/bin/bash

# Smart Tiffin Box Dashboard - GitHub Pages Deployment Script

echo "🚀 Deploying Smart Tiffin Box Dashboard to GitHub Pages..."

# Build the project
npm run build

# Navigate to dist folder
cd dist

# Initialize git repo if not exists
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Add all files
git add .

# Commit changes
git commit -m "Deploy Smart Tiffin Box Dashboard - $(date)"

# Push to GitHub Pages
git push -f https://github.com/$(git config --get user.name)/smart-tiffin-box-dashboard.git main:gh-pages

echo "✅ Deployment complete! Your dashboard is now live at: https://$(git config --get user.name).github.io/smart-tiffin-box-dashboard"
`;

fs.writeFileSync(path.join(__dirname, 'deploy.sh'), deployScript);

// Create Docker configuration
const dockerfile = `# Smart Tiffin Box Dashboard Dockerfile
FROM nginx:alpine

# Copy built files
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
`;

fs.writeFileSync(path.join(__dirname, 'Dockerfile'), dockerfile);

const nginxConfig = `events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Cache static assets
        location ~* \\.(css|js|ico|png|jpg|jpeg|gif|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Serve index.html for all routes (SPA)
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    }
}
`;

fs.writeFileSync(path.join(__dirname, 'nginx.conf'), nginxConfig);

console.log('✅ Build completed successfully!');
console.log('');
console.log('📦 Deployment Options:');
console.log('');
console.log('1. 🌐 Static Hosting (Netlify/Vercel/GitHub Pages):');
console.log('   - Upload the "dist" folder to your hosting provider');
console.log('   - Configure build output directory to "dist"');
console.log('');
console.log('2. 🐳 Docker Deployment:');
console.log('   - docker build -t smart-tiffin-box .');
console.log('   - docker run -p 80:80 smart-tiffin-box');
console.log('');
console.log('3. 📱 PWA Ready:');
console.log('   - Service worker included for offline functionality');
console.log('   - Installable as mobile app');
console.log('');
console.log('4. 🔧 Local Testing:');
console.log('   - npm run serve (Node.js required)');
console.log('   - python -m http.server 8000 (Python required)');
console.log('');
console.log('🚀 Your Smart Tiffin Box Dashboard is ready for deployment!');
