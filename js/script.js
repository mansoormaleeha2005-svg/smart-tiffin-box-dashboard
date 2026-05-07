// Smart Tiffin Box Dashboard JavaScript
// Real-time monitoring and control system for ESP32-based smart tiffin box

class SmartTiffinBox {
    constructor() {
        this.isConnected = false;
        this.temperature = 0;
        this.leakStatus = false;
        this.heaterState = false;
        this.mosfetStatus = false;
        this.safetyStatus = 'safe';
        this.activityLog = [];
        this.updateInterval = null;
        this.esp32Url = null; // Will be auto-detected
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showIPInputScreen();
        this.simulateInitialData();
    }

    bindEvents() {
        // IP Input screen events
        const connectBtn = document.getElementById('connectBtn');
        const simulateBtn = document.getElementById('simulateBtn');
        const esp32IpInput = document.getElementById('esp32Ip');
        
        connectBtn.addEventListener('click', () => {
            this.handleConnectButton();
        });
        
        simulateBtn.addEventListener('click', () => {
            this.handleSimulateButton();
        });
        
        esp32IpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleConnectButton();
            }
        });
        
        // IP input validation
        esp32IpInput.addEventListener('input', (e) => {
            this.validateIPInput(e.target);
        });

        // Heater toggle switch
        const heaterToggle = document.getElementById('heaterToggle');
        heaterToggle.addEventListener('change', (e) => {
            this.toggleHeater(e.target.checked);
        });

        // Floating orb click
        const floatingOrb = document.getElementById('floatingOrb');
        floatingOrb.addEventListener('click', () => {
            this.showSystemStatus();
        });
        
        // Double-click floating orb to change IP
        floatingOrb.addEventListener('dblclick', () => {
            this.showIPChangeDialog();
        });

        // Window resize for responsive adjustments
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    showIPInputScreen() {
        // Show IP input screen immediately
        const ipInputScreen = document.getElementById('ipInputScreen');
        ipInputScreen.classList.remove('hidden');
        
        // Focus on IP input
        setTimeout(() => {
            document.getElementById('esp32Ip').focus();
        }, 500);
    }

    validateIPInput(input) {
        const value = input.value;
        // Only allow digits and dots
        const sanitized = value.replace(/[^0-9.]/g, '');
        if (value !== sanitized) {
            input.value = sanitized;
        }
        
        // Validate IP format
        const ipRegex = /^(\d{1,3}\.){0,3}\d{0,3}$/;
        if (!ipRegex.test(sanitized)) {
            input.style.borderColor = 'var(--accent-red)';
        } else {
            input.style.borderColor = 'var(--glass-border)';
        }
    }

    async handleConnectButton() {
        const ipInput = document.getElementById('esp32Ip');
        const ipAddress = ipInput.value.trim();
        
        if (!ipAddress) {
            this.showToast('Please enter an IP address', 'error');
            return;
        }
        
        if (!this.isValidIPAddress(ipAddress)) {
            this.showToast('Please enter a valid IP address', 'error');
            return;
        }
        
        // Show loading screen
        this.hideIPInputScreen();
        this.showLoadingScreen();
        
        // Try to connect to the provided IP
        await this.attemptConnection(ipAddress);
    }

    handleSimulateButton() {
        // Hide IP input and start simulation
        this.hideIPInputScreen();
        this.showLoadingScreen();
        
        setTimeout(() => {
            this.showToast('Running in simulation mode', 'info');
            this.connectToDevice();
        }, 1000);
    }

    hideIPInputScreen() {
        const ipInputScreen = document.getElementById('ipInputScreen');
        ipInputScreen.classList.add('hidden');
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.remove('hidden');
    }

    isValidIPAddress(ip) {
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipRegex.test(ip)) return false;
        
        const parts = ip.split('.');
        return parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
        });
    }

    async attemptConnection(ipAddress) {
        const connectionMessage = document.getElementById('connectionMessage');
        
        try {
            connectionMessage.textContent = `Testing connection to ${ipAddress}...`;
            
            // Test the connection
            const isConnected = await this.testESP32Connection(ipAddress);
            
            if (isConnected) {
                this.esp32Url = `http://${ipAddress}`;
                connectionMessage.textContent = 'Successfully connected to ESP32!';
                this.showToast(`Connected to ESP32 at ${ipAddress}`, 'success');
                
                setTimeout(() => {
                    this.connectToDevice();
                }, 1000);
            } else {
                throw new Error('Connection failed');
            }
            
        } catch (error) {
            connectionMessage.textContent = `Failed to connect to ${ipAddress}`;
            this.showToast(`Could not connect to ESP32 at ${ipAddress}`, 'error');
            
            // Show retry option
            setTimeout(() => {
                if (confirm(`Failed to connect to ${ipAddress}. Would you like to:\n\n1. Try again\n2. Enter a different IP\n3. Run simulation`)) {
                    this.showIPInputScreen();
                } else {
                    this.handleSimulateButton();
                }
            }, 2000);
        }
    }

    startLoadingSequence() {
        // This method is no longer used - replaced by IP input screen
    }

    async detectESP32AndConnect() {
        this.showToast('Scanning for ESP32 devices...', 'info');
        
        // Try to auto-detect ESP32 IP address
        const detectedIP = await this.autoDetectESP32();
        
        if (detectedIP) {
            this.esp32Url = `http://${detectedIP}`;
            this.showToast(`ESP32 found at ${detectedIP}`, 'success');
            this.connectToDevice();
        } else {
            // Fallback to simulation if no ESP32 found
            this.showToast('No ESP32 found. Running in simulation mode.', 'warning');
            this.connectToDevice();
        }
    }

    async autoDetectESP32() {
        // Common ESP32 IP ranges to scan
        const commonIPs = [
            '192.168.1.100', '192.168.1.101', '192.168.1.102',
            '192.168.0.100', '192.168.0.101', '192.168.0.102',
            '192.168.4.1',   // ESP32 default AP mode
            '192.168.43.1',  // Android hotspot default
            '10.0.0.100', '10.0.0.101',
            '172.16.0.100', '172.16.0.101'
        ];

        // Get user's local IP to determine subnet
        const userIP = await this.getUserLocalIP();
        if (userIP) {
            const subnet = userIP.substring(0, userIP.lastIndexOf('.'));
            // Add IPs in the same subnet
            for (let i = 1; i <= 254; i++) {
                if (i === parseInt(userIP.split('.')[3])) continue; // Skip user's own IP
                commonIPs.unshift(`${subnet}.${i}`);
            }
        }

        // Try to connect to each IP with timeout
        for (const ip of commonIPs) {
            try {
                const response = await this.testESP32Connection(ip);
                if (response) {
                    return ip;
                }
            } catch (error) {
                // Continue to next IP
                continue;
            }
        }

        return null;
    }

    async getUserLocalIP() {
        try {
            // Use a public service to get local IP
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            // Fallback: try to get from WebRTC
            return new Promise((resolve) => {
                const rtc = new RTCPeerConnection({ iceServers: [] });
                rtc.createDataChannel('', { reliable: false });
                rtc.onicecandidate = (event) => {
                    if (event.candidate) {
                        const candidate = event.candidate.candidate;
                        const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                        if (match) {
                            resolve(match[1]);
                            rtc.close();
                        }
                    }
                };
                rtc.createOffer()
                    .then(offer => rtc.setLocalDescription(offer))
                    .catch(() => resolve(null));
                
                // Timeout after 2 seconds
                setTimeout(() => {
                    resolve(null);
                    rtc.close();
                }, 2000);
            });
        }
    }

    async testESP32Connection(ip) {
        const timeout = 3000; // 3 second timeout per IP
        
        return Promise.race([
            fetch(`http://${ip}/api/status`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        // Check if response looks like ESP32 data
                        if (data && typeof data === 'object' && 
                            (data.temperature !== undefined || data.heaterOn !== undefined)) {
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            })
            .catch(() => false),
            
            new Promise(resolve => 
                setTimeout(() => resolve(false), timeout)
            )
        ]);
    }

    connectToDevice() {
        // Simulate ESP32 connection
        this.showToast('Connecting to Smart Tiffin Box...', 'info');
        
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.hideLoadingScreen();
            this.showToast('Successfully connected to device!', 'success');
            this.addActivityLog(`System connected to ESP32 at ${this.esp32Url || 'simulation mode'}`);
            this.startRealTimeUpdates();
        }, 1500);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        
        if (connected) {
            statusDot.classList.remove('offline');
            statusText.textContent = 'ONLINE';
        } else {
            statusDot.classList.add('offline');
            statusText.textContent = 'OFFLINE';
        }
    }

    simulateInitialData() {
        // Set initial values for demonstration
        this.updateTemperature(25);
        this.updateLeakageStatus(false);
        this.updateHeaterStatus(false);
        this.updateMosfetStatus(false);
        this.updateSafetyStatus('safe');
    }

    startRealTimeUpdates() {
        // Start periodic updates from ESP32
        this.updateInterval = setInterval(() => {
            this.fetchDataFromESP32();
        }, 2000); // Update every 2 seconds
    }

    async fetchDataFromESP32() {
        if (this.esp32Url) {
            try {
                // Fetch real data from ESP32
                await this.fetchESP32Data();
            } catch (error) {
                console.error('Failed to fetch ESP32 data:', error);
                // Fall back to simulation if ESP32 connection fails
                this.simulateDataUpdate();
            }
        } else {
            // Simulate fetching data from ESP32
            this.simulateDataUpdate();
        }
    }

    simulateDataUpdate() {
        // Simulate temperature variations
        const tempVariation = (Math.random() - 0.5) * 4;
        const newTemp = Math.max(15, Math.min(80, this.temperature + tempVariation));
        this.updateTemperature(Math.round(newTemp * 10) / 10);

        // Simulate random leak detection (very rare)
        if (Math.random() < 0.01) {
            this.updateLeakageStatus(true);
            setTimeout(() => {
                this.updateLeakageStatus(false);
            }, 3000);
        }

        // Update MOSFET status based on heater state
        this.updateMosfetStatus(this.heaterState);

        // Update safety status based on conditions
        this.updateSafetyStatusBasedOnConditions();
    }

    updateTemperature(temp) {
        this.temperature = temp;
        const tempElement = document.getElementById('temperature');
        const tempGauge = document.getElementById('tempGauge');
        const tempStatus = document.getElementById('tempStatus');
        
        tempElement.textContent = `${temp}°C`;
        
        // Update gauge
        const percentage = Math.min(100, Math.max(0, (temp - 15) / 65 * 100));
        const offset = 565.48 - (565.48 * percentage / 100);
        tempGauge.style.strokeDashoffset = offset;
        
        // Update gauge color based on temperature
        if (temp < 30) {
            tempGauge.style.stroke = '#00d4ff';
            tempStatus.textContent = 'Normal';
            tempStatus.style.color = '#00d4ff';
        } else if (temp < 50) {
            tempGauge.style.stroke = '#ff9500';
            tempStatus.textContent = 'Warm';
            tempStatus.style.color = '#ff9500';
        } else {
            tempGauge.style.stroke = '#ff3838';
            tempStatus.textContent = 'High Temperature';
            tempStatus.style.color = '#ff3838';
            
            if (temp > 60) {
                this.showToast('Warning: High temperature detected!', 'warning');
            }
        }
    }

    updateLeakageStatus(isLeaking) {
        this.leakStatus = isLeaking;
        const leakageStatus = document.getElementById('leakageStatus');
        const leakageIndicator = document.getElementById('leakageIndicator');
        const leakIcon = document.getElementById('leakIcon');
        
        if (isLeaking) {
            leakageStatus.classList.add('warning');
            leakageStatus.querySelector('.status-text').textContent = 'WATER LEAK DETECTED';
            leakageIndicator.classList.add('active');
            leakIcon.textContent = '⚠️';
            this.showToast('ALERT: Water leakage detected!', 'error');
            this.addActivityLog('Water leak detected - Safety alert');
            this.updateSafetyStatus('danger');
        } else {
            leakageStatus.classList.remove('warning');
            leakageStatus.querySelector('.status-text').textContent = 'NO WATER LEAKAGE';
            leakageIndicator.classList.remove('active');
            leakIcon.textContent = '💧';
        }
    }

    toggleHeater(state) {
        this.heaterState = state;
        this.updateHeaterStatus(state);
        
        // In real implementation, send command to ESP32
        this.sendCommandToESP32('heater', state ? 'on' : 'off');
        
        if (state) {
            this.showToast('Heater activated', 'success');
            this.addActivityLog('Heater turned ON');
        } else {
            this.showToast('Heater deactivated', 'info');
            this.addActivityLog('Heater turned OFF');
        }
    }

    updateHeaterStatus(isOn) {
        const heaterStatus = document.getElementById('heaterStatus');
        const heaterIcon = document.getElementById('heaterIcon');
        
        if (isOn) {
            heaterStatus.textContent = 'Heater ON';
            heaterStatus.classList.add('active');
            heaterIcon.textContent = '🔥';
            heaterIcon.style.animation = 'glow 2s ease-in-out infinite';
        } else {
            heaterStatus.textContent = 'Heater OFF';
            heaterStatus.classList.remove('active');
            heaterIcon.textContent = '🔥';
            heaterIcon.style.animation = 'iconFloat 3s ease-in-out infinite';
        }
    }

    updateMosfetStatus(isProducingHeat) {
        this.mosfetStatus = isProducingHeat;
        const mosfetStatus = document.getElementById('mosfetStatus');
        const circuitAnimation = document.getElementById('circuitAnimation');
        
        if (isProducingHeat) {
            mosfetStatus.classList.add('active');
            mosfetStatus.querySelector('.status-text').textContent = 'MOSFET PRODUCING HEAT';
            circuitAnimation.classList.add('active');
        } else {
            mosfetStatus.classList.remove('active');
            mosfetStatus.querySelector('.status-text').textContent = 'MOSFET NOT PRODUCING HEAT';
            circuitAnimation.classList.remove('active');
        }
    }

    updateSafetyStatus(status) {
        this.safetyStatus = status;
        const safetyStatus = document.getElementById('safetyStatus');
        const safetyIndicator = document.getElementById('safetyIndicator');
        const safetyIcon = document.getElementById('safetyIcon');
        
        // Remove all status classes
        safetyStatus.classList.remove('safe', 'warning', 'danger');
        
        switch(status) {
            case 'safe':
                safetyStatus.classList.add('safe');
                safetyStatus.querySelector('.status-text').textContent = 'SAFE';
                safetyIcon.textContent = '🛡️';
                break;
            case 'warning':
                safetyStatus.classList.add('warning');
                safetyStatus.querySelector('.status-text').textContent = 'WARNING';
                safetyIcon.textContent = '⚠️';
                this.showToast('Warning: Check system status', 'warning');
                break;
            case 'danger':
                safetyStatus.classList.add('danger');
                safetyStatus.querySelector('.status-text').textContent = 'EMERGENCY';
                safetyIcon.textContent = '🚨';
                this.showToast('EMERGENCY: Immediate attention required!', 'error');
                break;
        }
    }

    updateSafetyStatusBasedOnConditions() {
        let status = 'safe';
        
        if (this.leakStatus) {
            status = 'danger';
        } else if (this.temperature > 60) {
            status = 'warning';
        } else if (this.temperature > 70) {
            status = 'danger';
        }
        
        if (status !== this.safetyStatus) {
            this.updateSafetyStatus(status);
        }
    }

    sendCommandToESP32(command, value) {
        // Placeholder for ESP32 communication
        // In real implementation, this would send HTTP requests to ESP32
        console.log(`Sending to ESP32: ${command} = ${value}`);
        
        // Example implementation:
        // fetch(`${this.esp32Url}/api/${command}`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ value: value })
        // })
        // .then(response => response.json())
        // .then(data => console.log('ESP32 response:', data))
        // .catch(error => console.error('ESP32 communication error:', error));
    }

    addActivityLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const activity = { timestamp, message };
        
        this.activityLog.unshift(activity);
        if (this.activityLog.length > 50) {
            this.activityLog.pop();
        }
        
        this.updateActivityFeed();
    }

    updateActivityFeed() {
        const feedElement = document.getElementById('activityFeed');
        const latestActivities = this.activityLog.slice(0, 10);
        
        feedElement.innerHTML = latestActivities.map(activity => `
            <div class="activity-item">
                <span class="timestamp">${activity.timestamp}</span>
                <span class="message">${activity.message}</span>
            </div>
        `).join('');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        }[type] || 'ℹ️';
        
        toast.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 4000);
    }

    showSystemStatus() {
        const status = `
            System Status:
            - Connection: ${this.isConnected ? 'Online' : 'Offline'}
            - Temperature: ${this.temperature}°C
            - Leak Detection: ${this.leakStatus ? 'DETECTED' : 'Clear'}
            - Heater: ${this.heaterState ? 'ON' : 'OFF'}
            - MOSFET: ${this.mosfetStatus ? 'Active' : 'Inactive'}
            - Safety: ${this.safetyStatus.toUpperCase()}
        `;
        
        console.log(status);
        this.showToast('System status logged to console', 'info');
    }

    handleResize() {
        // Handle responsive adjustments if needed
        console.log('Window resized');
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, reduce update frequency
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = setInterval(() => {
                    this.fetchDataFromESP32();
                }, 10000); // Update every 10 seconds when hidden
            }
        } else {
            // Page is visible, restore normal update frequency
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = setInterval(() => {
                    this.fetchDataFromESP32();
                }, 2000); // Update every 2 seconds when visible
            }
        }
    }

    // ESP32 Integration Methods
    async fetchESP32Data() {
        try {
            const response = await fetch(`${this.esp32Url}/api/status`);
            const data = await response.json();
            
            // Update all values from ESP32
            this.updateTemperature(data.temperature);
            this.updateLeakageStatus(data.waterLeak);
            this.updateHeaterStatus(data.heaterOn);
            this.updateMosfetStatus(data.mosfetActive);
            
        } catch (error) {
            console.error('Failed to fetch ESP32 data:', error);
            this.showToast('Lost connection to device', 'error');
            this.updateConnectionStatus(false);
        }
    }

    async setHeaterState(state) {
        try {
            const response = await fetch(`${this.esp32Url}/api/heater`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state: state })
            });
            
            const result = await response.json();
            if (result.success) {
                this.updateHeaterStatus(state);
                this.addActivityLog(`Heater ${state ? 'activated' : 'deactivated'} via ESP32`);
            }
        } catch (error) {
            console.error('Failed to set heater state:', error);
            this.showToast('Failed to control heater', 'error');
        }
    }

    // Public methods for external access
    getSystemData() {
        return {
            temperature: this.temperature,
            leakStatus: this.leakStatus,
            heaterState: this.heaterState,
            mosfetStatus: this.mosfetStatus,
            safetyStatus: this.safetyStatus,
            isConnected: this.isConnected,
            activityLog: this.activityLog
        };
    }

    // Emergency shutdown
    emergencyShutdown() {
        this.updateHeaterStatus(false);
        this.updateSafetyStatus('danger');
        this.showToast('EMERGENCY SHUTDOWN ACTIVATED', 'error');
        this.addActivityLog('EMERGENCY: System shutdown initiated');
        
        // Send emergency command to ESP32
        this.sendCommandToESP32('emergency', 'shutdown');
    }

    showIPChangeDialog() {
        // Create modal dialog for IP change
        const modal = document.createElement('div');
        modal.className = 'ip-change-modal';
        modal.innerHTML = `
            <div class="ip-change-content">
                <h3>Change ESP32 IP Address</h3>
                <p>Current IP: ${this.esp32Url || 'Not connected'}</p>
                <div class="ip-input-group">
                    <input type="text" id="newEsp32Ip" placeholder="192.168.1.100" maxlength="15">
                    <div class="ip-buttons">
                        <button id="confirmIpBtn">Connect</button>
                        <button id="cancelIpBtn">Cancel</button>
                    </div>
                </div>
                <div class="ip-help">
                    <small>Enter the new ESP32 IP address and click Connect</small>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .ip-change-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .ip-change-content {
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                padding: 30px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                animation: slideUp 0.3s ease-out;
            }
            
            .ip-change-content h3 {
                color: var(--accent-blue);
                margin-bottom: 15px;
                font-size: 1.3rem;
            }
            
            .ip-change-content p {
                color: var(--text-secondary);
                margin-bottom: 20px;
                font-size: 0.9rem;
            }
            
            .ip-input-group input {
                width: 100%;
                padding: 12px;
                background: var(--glass-bg);
                border: 2px solid var(--glass-border);
                border-radius: 10px;
                color: var(--text-primary);
                font-size: 1rem;
                font-family: 'Courier New', monospace;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .ip-input-group input:focus {
                outline: none;
                border-color: var(--accent-blue);
                box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
            }
            
            .ip-buttons {
                display: flex;
                gap: 10px;
            }
            
            .ip-buttons button {
                flex: 1;
                padding: 10px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            #confirmIpBtn {
                background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
                color: white;
            }
            
            #cancelIpBtn {
                background: var(--glass-bg);
                color: var(--text-primary);
                border: 1px solid var(--glass-border);
            }
            
            .ip-help {
                margin-top: 15px;
                color: var(--text-secondary);
                font-size: 0.8rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('newEsp32Ip').focus();
        }, 100);
        
        // Handle events
        const newIpInput = document.getElementById('newEsp32Ip');
        const confirmBtn = document.getElementById('confirmIpBtn');
        const cancelBtn = document.getElementById('cancelIpBtn');
        
        // Set current IP as placeholder if exists
        if (this.esp32Url) {
            const currentIP = this.esp32Url.replace('http://', '');
            newIpInput.value = currentIP;
            newIpInput.select();
        }
        
        // Input validation
        newIpInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const sanitized = value.replace(/[^0-9.]/g, '');
            if (value !== sanitized) {
                e.target.value = sanitized;
            }
        });
        
        // Enter key to connect
        newIpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleIPChange(newIpInput.value, modal);
            }
        });
        
        confirmBtn.addEventListener('click', () => {
            this.handleIPChange(newIpInput.value, modal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
    
    async handleIPChange(newIP, modal) {
        const ipAddress = newIP.trim();
        
        if (!ipAddress) {
            this.showToast('Please enter an IP address', 'error');
            return;
        }
        
        if (!this.isValidIPAddress(ipAddress)) {
            this.showToast('Please enter a valid IP address', 'error');
            return;
        }
        
        // Show connecting message
        this.showToast(`Connecting to ${ipAddress}...`, 'info');
        
        try {
            // Test the new connection
            const isConnected = await this.testESP32Connection(ipAddress);
            
            if (isConnected) {
                // Stop current updates
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                }
                
                // Update the URL
                this.esp32Url = `http://${ipAddress}`;
                this.isConnected = true;
                
                // Update connection status
                this.updateConnectionStatus(true);
                
                // Close modal
                document.body.removeChild(modal);
                
                // Show success message
                this.showToast(`Successfully connected to ${ipAddress}`, 'success');
                this.addActivityLog(`Changed ESP32 IP to ${ipAddress}`);
                
                // Restart updates
                this.startRealTimeUpdates();
                
            } else {
                throw new Error('Connection failed');
            }
            
        } catch (error) {
            this.showToast(`Failed to connect to ${ipAddress}`, 'error');
            
            // Ask if user wants to retry or cancel
            setTimeout(() => {
                if (confirm(`Failed to connect to ${ipAddress}. Would you like to try again?`)) {
                    // Keep modal open for retry
                    return;
                } else {
                    // Close modal
                    document.body.removeChild(modal);
                }
            }, 1000);
        }
    }

    // Cleanup method
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize the Smart Tiffin Box Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.smartTiffinBox = new SmartTiffinBox();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + H: Toggle heater
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            const heaterToggle = document.getElementById('heaterToggle');
            heaterToggle.checked = !heaterToggle.checked;
            heaterToggle.dispatchEvent(new Event('change'));
        }
        
        // Ctrl/Cmd + S: Show system status
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            window.smartTiffinBox.showSystemStatus();
        }
        
        // Ctrl/Cmd + I: Change IP address
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            window.smartTiffinBox.showIPChangeDialog();
        }
        
        // Ctrl/Cmd + E: Emergency shutdown
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (confirm('Are you sure you want to initiate emergency shutdown?')) {
                window.smartTiffinBox.emergencyShutdown();
            }
        }
    });
    
    // Add some initial activity logs
    setTimeout(() => {
        window.smartTiffinBox.addActivityLog('Dashboard initialized successfully');
        window.smartTiffinBox.addActivityLog('All systems operational');
    }, 2500);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartTiffinBox;
}
