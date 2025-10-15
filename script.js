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

        // Sign up button
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => this.handleSignup(e));
        }

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

        // Check signup availability
        this.checkSignupAvailability();
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
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        if (this.useMockData) {
            // Fallback authentication for when Firebase is not available
            const validAdmins = {
                'admin@yoursruly.com': 'admin123',
                'noah@yoursruly.com': 'airjb2024',
            };
            
            if (validAdmins[email] && validAdmins[email] === password) {
                this.isAuthenticated = true;
                const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                localStorage.setItem('airjb-admin-auth', 'authenticated');
                localStorage.setItem('airjb-admin-auth-expiry', expiryTime.toString());
                this.showDashboard();
            } else {
                this.showError('Invalid credentials. Access denied.');
            }
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Authenticating...';
        submitBtn.disabled = true;

        try {
            // Firebase Auth sign in
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Verify admin status (this will be handled by onAuthStateChanged)
            console.log('Admin login successful:', user.email);
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific Firebase Auth errors
            let errorMessage = 'Login failed. Please check your credentials.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Admin account not found.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Handle logout
    async handleLogout(e) {
        e.preventDefault();
        
        if (this.useMockData) {
            // Fallback logout
            this.isAuthenticated = false;
            localStorage.removeItem('airjb-admin-auth');
            localStorage.removeItem('airjb-admin-auth-expiry');
            this.showLogin();
            return;
        }

        try {
            // Firebase Auth sign out
            await this.auth.signOut();
            console.log('Admin logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if Firebase fails
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showLogin();
        }
    }

    // Check if admin signup is available by reading GitHub file
    async checkSignupAvailability() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/AirJBn/AirJBhub/main/Yourtruly.txt');
            const text = await response.text();
            
            const signupBtn = document.getElementById('signup-btn');
            if (signupBtn) {
                if (text.trim().toLowerCase() === 'open') {
                    signupBtn.style.display = 'block';
                    console.log('Admin signup is OPEN');
                } else {
                    signupBtn.style.display = 'none';
                    console.log('Admin signup is CLOSED');
                }
            }
        } catch (error) {
            console.error('Error checking signup availability:', error);
            // For now, show button if we can't check (you can change this)
            const signupBtn = document.getElementById('signup-btn');
            if (signupBtn) {
                signupBtn.style.display = 'block'; // Changed to show on error for testing
                console.log('Showing signup button due to fetch error');
            }
        }
    }

    // Handle admin signup
    async handleSignup(e) {
        e.preventDefault();
        
        // Double-check signup availability
        try {
            const response = await fetch('https://raw.githubusercontent.com/AirJBn/AirJBhub/main/Yourtruly.txt');
            const text = await response.text();
            
            if (text.trim().toLowerCase() !== 'open') {
                this.showError('Admin signup is currently closed.');
                return;
            }
        } catch (error) {
            this.showError('Unable to verify signup availability. Please try again later.');
            return;
        }

        // Show signup form (you can customize this)
        const email = prompt('Enter your email address for admin access:');
        const password = prompt('Create a password (minimum 6 characters):');
        
        if (!email || !password) {
            return;
        }
        
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long.');
            return;
        }

        if (this.useMockData) {
            this.showError('Signup not available in offline mode.');
            return;
        }

        const signupBtn = document.getElementById('signup-btn');
        const originalText = signupBtn.textContent;
        signupBtn.textContent = 'Creating Account...';
        signupBtn.disabled = true;

        try {
            // Create Firebase Auth user
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Create admin record in database
            const adminData = {
                email: email,
                role: 'admin', // Default role for new signups
                active: false, // Requires owner approval
                permissions: {
                    analytics: false,
                    support: false,
                    users: false
                },
                createdAt: new Date().toISOString(),
                needsApproval: true
            };
            
            await this.database.ref(`admins/${user.uid}`).set(adminData);
            
            // Sign out the new user (they need approval first)
            await this.auth.signOut();
            
            this.showNotification(
                'Account Created Successfully',
                'Your admin account has been created and is pending approval. You will be notified when access is granted.',
                'success'
            );
            
        } catch (error) {
            console.error('Signup error:', error);
            
            let errorMessage = 'Failed to create account. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
            }
            
            this.showError(errorMessage);
        } finally {
            signupBtn.textContent = originalText;
            signupBtn.disabled = false;
        }
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

    // Check signup availability independently (fallback)
    setTimeout(() => {
        if (window.airjbDashboard) {
            window.airjbDashboard.checkSignupAvailability();
        }
    }, 2000);

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

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
