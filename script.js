// AirJB Admin Management Dashboard
class AirJBDashboard {
    constructor() {
        this.isAuthenticated = false;
        this.initializeFirebase();
        this.bindEvents();
        this.checkAuthStatus();
    }

    // Initialize Firebase (using the same config as the app)
    initializeFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyDtdxcSoVmLj-gGRkj0E5zXrTRHPZK3Fi4",
            authDomain: "airjb-f1883.firebaseapp.com",
            databaseURL: "https://airjb-f1883-default-rtdb.firebaseio.com/",
            projectId: "airjb-f1883",
            storageBucket: "airjb-f1883.appspot.com",
            messagingSenderId: "485974977846",
            appId: "1:485974977846:web:f1883airjb001"
        };

        // Check if Firebase is already initialized
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            this.auth = firebase.auth();
            this.database = firebase.database();
        } else if (typeof firebase !== 'undefined') {
            this.auth = firebase.auth();
            this.database = firebase.database();
        } else {
            console.warn('Firebase not loaded, using mock data');
            this.useMockData = true;
        }
    }

    // Bind event listeners
    bindEvents() {
        // Admin login form
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Sign up button (now just a link to signup.html)

        // Dashboard refresh button (if added)
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
    }

    // Check authentication status
    checkAuthStatus() {
        if (this.useMockData) {
            // Fallback for when Firebase is not available
            const authToken = localStorage.getItem('airjb-admin-auth');
            const authExpiry = localStorage.getItem('airjb-admin-auth-expiry');
            
            if (authToken && authExpiry && new Date().getTime() < parseInt(authExpiry)) {
                this.isAuthenticated = true;
                this.showDashboard();
            } else {
                this.showLogin();
            }
            return;
        }

        // Firebase Auth state listener
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check if user is admin
                const isAdmin = await this.verifyAdminUser(user);
                if (isAdmin) {
                    this.currentUser = user;
                    this.isAuthenticated = true;
                    this.showDashboard();
                } else {
                    // User is authenticated but not admin
                    await this.auth.signOut();
                    this.showError('Access denied. Admin privileges required.');
                    this.showLogin();
                }
            } else {
                this.isAuthenticated = false;
                this.currentUser = null;
                this.showLogin();
            }
        });

    }

    // Verify if authenticated user has admin privileges
    async verifyAdminUser(user) {
        try {
            // Check admin collection for this user
            const adminSnapshot = await this.database.ref(`admins/${user.uid}`).once('value');
            
            if (adminSnapshot.exists()) {
                const adminData = adminSnapshot.val();
                // Verify admin is active and has proper role
                return adminData.active === true && adminData.role && adminData.permissions;
            }
            
            return false;
        } catch (error) {
            console.error('Error verifying admin user:', error);
            return false;
        }
    }

    // Handle admin login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        
        if (this.useMockData) {
            // Fallback for when Firebase is not available
            const adminEmail = atob('bm9haHdlbGxkQGdtYWlsLmNvbQ==');
            const adminPass = atob('QWlyamJodWJAeW91cnN0cnVseTE5');
            
            if (email === adminEmail && password === adminPass) {
                this.isAuthenticated = true;
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('airjb-admin-auth', 'authenticated');
                localStorage.setItem('airjb-admin-auth-expiry', expiryTime.toString());
                window.location.href = 'airjb-hub.html';
            } else {
                this.showError('Invalid credentials. Access denied.');
            }
            return;
        }

        try {
            // Sign in with Firebase Auth
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check if user is an admin
            const isAdmin = await this.verifyAdminUser(user);
            if (isAdmin) {
                this.currentUser = user;
                this.isAuthenticated = true;
                
                // Store session info
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('airjb-admin-auth', 'authenticated');
                localStorage.setItem('airjb-admin-auth-expiry', expiryTime.toString());
                localStorage.setItem('airjb-admin-uid', user.uid);
                
                // Redirect to the main hub
                window.location.href = 'airjb-hub.html';
            } else {
                // User is authenticated but not admin
                await this.auth.signOut();
                this.showError('Access denied. Admin privileges required.');
            }
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please check your credentials.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No admin account found with this email address.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later.';
            }
            
            this.showError(errorMessage);
        }
    }

    // Handle logout
    async handleLogout(e) {
        e.preventDefault();
        
        try {
            if (!this.useMockData && this.auth.currentUser) {
                await this.auth.signOut();
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('airjb-admin-auth');
        localStorage.removeItem('airjb-admin-auth-expiry');
        localStorage.removeItem('airjb-admin-uid');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }



    // Show login page
    showLogin() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('dashboard-content').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
        document.querySelector('.navbar').style.display = 'none';
    }

    // Show dashboard
    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';
        document.querySelector('.navbar').style.display = 'block';
        
        // Load dashboard data
        this.loadDashboardData();
        this.startRealTimeUpdates();
    }

    // Show error message
    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            font-size: 0.9rem;
            text-align: center;
            animation: shake 0.5s ease-in-out;
        `;
        
        // Remove existing error
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error to form
        const loginForm = document.getElementById('admin-login-form');
        loginForm.appendChild(errorDiv);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    // Handle navbar scroll effect
    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        }
    }

    // Load dashboard data
    async loadDashboardData() {
        if (this.useMockData) {
            this.displayMockData();
            return;
        }

        try {
            // Load user statistics
            await this.loadUserStats();
            
            // Load support ticket stats
            await this.loadSupportStats();
            
            // Load download stats (from GitHub API)
            await this.loadDownloadStats();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.displayMockData();
        }
    }

    // Load user statistics from Firebase
    async loadUserStats() {
        try {
            const pilotsRef = this.database.ref('pilots');
            const snapshot = await pilotsRef.once('value');
            
            if (snapshot.exists()) {
                const pilots = snapshot.val();
                const totalUsers = Object.keys(pilots).length;
                
                // Count active users (online in last 24 hours)
                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                
                let activeUsers = 0;
                Object.values(pilots).forEach(pilot => {
                    if (pilot.isOnline || (pilot.lastSeen && new Date(pilot.lastSeen) > oneDayAgo)) {
                        activeUsers++;
                    }
                });

                this.updateStat('total-users', totalUsers);
                this.updateStat('active-sessions', activeUsers);
            } else {
                this.updateStat('total-users', 0);
                this.updateStat('active-sessions', 0);
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
            this.updateStat('total-users', 'Error');
            this.updateStat('active-sessions', 'Error');
        }
    }

    // Load support ticket statistics
    async loadSupportStats() {
        try {
            const ticketsRef = this.database.ref('support_tickets');
            const snapshot = await ticketsRef.once('value');
            
            if (snapshot.exists()) {
                const tickets = snapshot.val();
                const openTickets = Object.values(tickets).filter(ticket => 
                    ticket.status === 'open' || ticket.status === 'in_progress'
                ).length;
                
                this.updateStat('support-tickets', openTickets);
            } else {
                this.updateStat('support-tickets', 0);
            }
        } catch (error) {
            console.error('Error loading support stats:', error);
            this.updateStat('support-tickets', 'Error');
        }
    }

    // Load download statistics from GitHub API
    async loadDownloadStats() {
        try {
            const response = await fetch('https://api.github.com/repos/AirJBn/AirJB/releases');
            const releases = await response.json();
            
            let totalDownloads = 0;
            releases.forEach(release => {
                release.assets.forEach(asset => {
                    totalDownloads += asset.download_count || 0;
                });
            });
            
            this.updateStat('total-downloads', totalDownloads);
        } catch (error) {
            console.error('Error loading download stats:', error);
            // Fallback to estimated downloads
            this.updateStat('total-downloads', '2.5K+');
        }
    }

    // Update a statistic display
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Add loading class removal and number formatting
            element.classList.remove('loading');
            
            if (typeof value === 'number') {
                element.textContent = this.formatNumber(value);
            } else {
                element.textContent = value;
            }
            
            // Add a subtle animation
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Format numbers for display
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Display mock data when Firebase is unavailable
    displayMockData() {
        const mockData = {
            'total-users': 1247,
            'total-downloads': 2834,
            'active-sessions': 89,
            'support-tickets': 3
        };

        Object.entries(mockData).forEach(([id, value]) => {
            setTimeout(() => {
                this.updateStat(id, value);
            }, Math.random() * 1000 + 500); // Stagger the updates
        });
    }

    // Start real-time updates for dashboard
    startRealTimeUpdates() {
        if (this.useMockData) {
            // Update mock data periodically
            setInterval(() => {
                this.displayMockData();
            }, 30000); // Update every 30 seconds
            return;
        }

        // Set up real-time listeners for Firebase data
        try {
            // Listen for pilot changes
            this.database.ref('pilots').on('value', () => {
                this.loadUserStats();
            });

            // Listen for support ticket changes
            this.database.ref('support_tickets').on('value', () => {
                this.loadSupportStats();
            });
        } catch (error) {
            console.error('Error setting up real-time updates:', error);
        }

        // Refresh download stats every 5 minutes
        setInterval(() => {
            this.loadDownloadStats();
        }, 5 * 60 * 1000);
    }

    // Utility method to show notifications
    showNotification(title, message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<strong>${title}</strong><br>${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : '#00ff88'};
            color: ${type === 'error' ? '#ffffff' : '#000000'};
            padding: 12px 20px;
            border-radius: 4px;
            font-family: 'Josefin Sans', sans-serif;
            font-weight: 300;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Analytics and tracking
class AirJBAnalytics {
    constructor() {
        this.trackPageView();
        this.trackUserInteractions();
    }

    trackPageView() {
        // Simple page view tracking
        console.log('Page view tracked:', window.location.pathname);
    }

    trackUserInteractions() {
        // Track button clicks
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.textContent.trim();
                console.log('Button clicked:', action);
            });
        });

        // Track section views
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    console.log('Section viewed:', sectionId);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('section[id]').forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add loading class to stat numbers
    document.querySelectorAll('.stat-number').forEach(el => {
        el.classList.add('loading');
    });

    // Initialize dashboard
    window.airjbDashboard = new AirJBDashboard();
    
    // Initialize analytics
    window.airjbAnalytics = new AirJBAnalytics();


    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .stat-number {
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
});

