# Smart Tiffin Box Dashboard

A modern, responsive IoT dashboard for monitoring and controlling ESP32-based Smart Tiffin Box systems with real-time temperature monitoring, water leakage detection, and heater control.

## Features

### 🌡️ Real-Time Monitoring
- **Temperature Monitoring**: Live filament plate temperature with color-coded alerts
- **Water Leakage Detection**: Instant alerts for water leakage with visual warnings
- **MOSFET Status**: Real-time MOSFET heat production monitoring
- **Safety Status**: Comprehensive safety monitoring with emergency alerts

### 🎛️ Control Systems
- **Heater Control**: Toggle switch for filament heater control
- **Emergency Shutdown**: One-click emergency shutdown functionality
- **ESP32 Integration**: Ready for seamless ESP32 microcontroller integration

### 📱 Responsive Design
- **Mobile Optimized**: Fully responsive design for Android phones, tablets, and desktop
- **Glassmorphism UI**: Modern glassmorphic cards with blur effects
- **Futuristic Theme**: Cyberpunk-inspired IoT dashboard with neon accents
- **Smooth Animations**: Professional transitions and micro-interactions

### 🔄 Live Features
- **Activity Feed**: Real-time activity logging with timestamps
- **Toast Notifications**: Non-intrusive alerts for system events
- **Auto-refresh**: Automatic data updates every 2 seconds
- **Connection Status**: Live connection indicator with pulse animations

## Quick Start

1. **Open the Dashboard**
   ```bash
   # Simply open index.html in your web browser
   open index.html
   ```

2. **ESP32 Integration**
   Update the ESP32 URL in `js/script.js`:
   ```javascript
   this.esp32Url = 'http://YOUR_ESP32_IP_ADDRESS';
   ```

3. **Access the Dashboard**
   - Open `index.html` in any modern web browser
   - The dashboard will automatically simulate real-time data
   - Connect to your ESP32 device for actual monitoring

## Project Structure

```
smart-tiffin-box/
├── index.html          # Main dashboard HTML
├── css/
│   └── style.css       # Complete styling with animations
├── js/
│   └── script.js       # Dashboard functionality and ESP32 integration
├── assets/             # Static assets (icons, images)
└── README.md           # This file
```

## Dashboard Components

### Header Section
- Smart Tiffin Box branding
- Real-time connection status indicator
- Online/Offline status with glowing animations

### Temperature Card
- Large temperature display in °C
- Animated circular gauge
- Color-coded temperature status:
  - 🔵 Blue: Normal (< 30°C)
  - 🟠 Orange: Warm (30-50°C)
  - 🔴 Red: High Temperature (> 50°C)

### Water Leakage Card
- Visual leak detection status
- Animated warning indicators
- Red pulse animations during leakage

### Heater Control Card
- Modern toggle switch
- Glowing effect when active
- Flame icon animations

### MOSFET Status Card
- Circuit animation effects
- Real-time heat production status
- Animated flow indicators

### Safety Status Card
- Three-tier safety system:
  - 🟢 SAFE: All systems normal
  - 🟠 WARNING: Attention required
  - 🔴 EMERGENCY: Immediate action needed

### Live Activity Feed
- Timestamped activity logs
- Auto-scrolling feed
- Hover effects for better readability

## ESP32 Integration

### API Endpoints

The dashboard is designed to work with the following ESP32 API endpoints:

#### Get System Status
```http
GET /api/status
```
Response:
```json
{
  "temperature": 25.5,
  "waterLeak": false,
  "heaterOn": true,
  "mosfetActive": true
}
```

#### Control Heater
```http
POST /api/heater
Content-Type: application/json

{
  "state": true
}
```

#### Emergency Shutdown
```http
POST /api/emergency
Content-Type: application/json

{
  "action": "shutdown"
}
```

### JavaScript Integration

The dashboard provides ready-to-use methods for ESP32 communication:

```javascript
// Fetch data from ESP32
await window.smartTiffinBox.fetchESP32Data();

// Control heater
await window.smartTiffinBox.setHeaterState(true);

// Emergency shutdown
window.smartTiffinBox.emergencyShutdown();
```

## Keyboard Shortcuts

- **Ctrl/Cmd + H**: Toggle heater on/off
- **Ctrl/Cmd + S**: Show system status in console
- **Ctrl/Cmd + E**: Emergency shutdown (with confirmation)

## Customization

### Colors and Theme
Edit the CSS variables in `css/style.css`:

```css
:root {
    --accent-blue: #00d4ff;
    --accent-cyan: #00ff88;
    --accent-orange: #ff6b35;
    --accent-red: #ff3838;
}
```

### Update Intervals
Modify the refresh rate in `js/script.js`:

```javascript
// Update every 2 seconds
this.updateInterval = setInterval(() => {
    this.fetchDataFromESP32();
}, 2000);
```

### Temperature Thresholds
Adjust temperature alert levels:

```javascript
updateTemperature(temp) {
    if (temp < 30) {
        // Normal range
    } else if (temp < 50) {
        // Warm warning
    } else {
        // High temperature alert
    }
}
```

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile Chrome/Safari

## Performance Features

- **Optimized Animations**: GPU-accelerated CSS transforms
- **Efficient Updates**: Throttled API calls to prevent overload
- **Memory Management**: Automatic activity log cleanup
- **Background Optimization**: Reduced update frequency when tab is hidden

## Security Considerations

- **HTTPS Recommended**: Use HTTPS for ESP32 communication in production
- **CORS Configuration**: Ensure proper CORS setup on ESP32 web server
- **Authentication**: Add API key authentication for ESP32 endpoints

## Troubleshooting

### Connection Issues
1. Verify ESP32 IP address in `script.js`
2. Check network connectivity
3. Ensure ESP32 web server is running

### Display Issues
1. Clear browser cache
2. Check browser console for errors
3. Verify CSS and JS files are loading correctly

### Performance Issues
1. Close unnecessary browser tabs
2. Check ESP32 response times
3. Monitor memory usage

## License

This project is open-source and available under the MIT License.

## Support

For technical support or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify ESP32 API endpoints are accessible

---

**Smart Tiffin Box Dashboard** - Modern IoT monitoring for intelligent food warming systems 🍱🔥
