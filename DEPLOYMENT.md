# Smart Tiffin Box Dashboard - Deployment Guide

## 🚀 Quick Deployment Options

### 1. Static Hosting (Recommended)

#### Netlify
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/smart-tiffin-box-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

#### Vercel
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

#### GitHub Pages
1. **Enable GitHub Pages**
   - Go to your repository Settings
   - Scroll to "GitHub Pages"
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Click Save

2. **Build and Deploy**
   ```bash
   npm run build
   npm run deploy:github
   ```

### 2. Docker Deployment

#### Build and Run
```bash
# Build Docker image
docker build -t smart-tiffin-box .

# Run container
docker run -p 80:80 smart-tiffin-box

# Or with docker-compose
docker-compose up -d
```

#### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  smart-tiffin-box:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### 3. Traditional Web Server

#### Apache
Copy `dist/` folder to your web root:
```bash
sudo cp -r dist/* /var/www/html/
```

#### Nginx
```bash
sudo cp -r dist/* /usr/share/nginx/html/
sudo nginx -t && sudo systemctl reload nginx
```

## 🔧 Build Process

### Automatic Build
```bash
# Install dependencies (optional)
npm install

# Build for production
npm run build

# Start local server
npm run serve
```

### Manual Build
```bash
# Create dist folder
mkdir dist

# Copy files
cp index.html dist/
cp -r css dist/
cp -r js dist/
cp -r assets dist/

# Minify (optional)
npm run minify
```

## 📱 PWA Features

The dashboard includes Progressive Web App capabilities:

- **Service Worker**: Offline functionality
- **App Manifest**: Installable on mobile devices
- **Responsive Design**: Works on all screen sizes
- **Cache Strategy**: Fast loading after first visit

### Testing PWA
1. Open dashboard in Chrome
2. Open DevTools → Application
3. Check "Service Workers" and "Manifest"
4. Look for "Add to Home Screen" prompt on mobile

## 🔒 Security Headers

The deployment includes security headers:

```http
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 🌐 Environment Configuration

### Production Variables
Create `.env.production`:
```env
NODE_ENV=production
API_URL=https://your-esp32-domain.com
DEBUG=false
```

### Development Variables
Create `.env.development`:
```env
NODE_ENV=development
API_URL=http://localhost:8000
DEBUG=true
```

## 📊 Performance Optimization

### Included Optimizations
- **Minified CSS/JS**: Reduced file sizes
- **Image Optimization**: Compressed assets
- **Gzip Compression**: Server-side compression
- **Browser Caching**: Long-term cache headers
- **Service Worker**: Offline caching

### Performance Monitoring
Add Google Analytics or similar:
```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🔍 SEO Optimization

### Meta Tags
The build automatically adds:
- Description and keywords
- Open Graph tags for social sharing
- Twitter Card metadata
- Viewport and theme-color settings

### Sitemap
Create `public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure ESP32 sends proper CORS headers
- Add to ESP32 code: `server.sendHeader("Access-Control-Allow-Origin", "*");`

#### Connection Issues
- Check ESP32 IP address
- Verify network connectivity
- Test with `curl http://ESP32_IP/api/status`

#### Mobile Issues
- Ensure HTTPS for production
- Check service worker registration
- Test in different browsers

#### Performance Issues
- Enable gzip compression on server
- Optimize images and assets
- Use CDN for static files

### Debug Mode
Enable debug mode by adding `?debug=true` to URL:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

## 📈 Monitoring

### Uptime Monitoring
Use services like:
- Uptime Robot
- Pingdom
- Statuspage

### Error Tracking
Add error tracking:
```javascript
// Add to script.js
window.addEventListener('error', function(e) {
    // Send to error tracking service
    fetch('/api/error', {
        method: 'POST',
        body: JSON.stringify({
            error: e.error.message,
            stack: e.error.stack,
            url: window.location.href
        })
    });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Smart Tiffin Box

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --prod --dir=dist
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Support

For deployment issues:
1. Check browser console for errors
2. Verify server configuration
3. Test with local development server
4. Review this troubleshooting guide

---

**Your Smart Tiffin Box Dashboard is now production-ready! 🎉**
