# AirJBHub Website

Official website and management dashboard for AirJB - Professional flight tracking application with Microsoft Flight Simulator integration.

## 🌐 Live Website

Visit the live website at: [https://airjbn.github.io/AirJBhub/](https://airjbn.github.io/AirJBhub/)

## 📋 Features

- **Modern Design**: Clean, professional interface using Josefin Sans typography
- **Management Dashboard**: Real-time statistics and user analytics
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Firebase Integration**: Live data from the AirJB application
- **GitHub Pages**: Automatic deployment and hosting

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with Josefin Sans font family
- **Backend**: Firebase Realtime Database
- **Deployment**: GitHub Actions + GitHub Pages
- **Analytics**: Custom tracking and user interaction monitoring

## 📊 Dashboard Features

The management dashboard provides real-time insights into:

- **User Analytics**: Total registered users and active sessions
- **Download Statistics**: GitHub release download counts
- **Support Metrics**: Open support ticket tracking
- **Real-time Updates**: Live data synchronization with Firebase

## 🛠️ Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/AirJBn/AirJBhub.git
cd AirJBhub
```

2. Serve the files locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

### Project Structure

```
AirJBhub/
├── index.html          # Main website page
├── styles.css          # CSS styles with Josefin Sans theme
├── script.js           # JavaScript for dashboard and interactions
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions deployment workflow
├── assets/             # Images and static assets
└── README.md           # This file
```

### Deployment

The website automatically deploys to GitHub Pages when changes are pushed to the `main` branch. The deployment process:

1. **Build**: Copies files and creates necessary assets
2. **Deploy**: Publishes to GitHub Pages using GitHub Actions
3. **Live**: Available at the GitHub Pages URL

## 🔧 Configuration

### Firebase Configuration

The dashboard connects to Firebase using the same configuration as the main AirJB application:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDtdxcSoVmLj-gGRkj0E5zXrTRHPZK3Fi4",
    authDomain: "airjb-f1883.firebaseapp.com",
    databaseURL: "https://airjb-f1883-default-rtdb.firebaseio.com/",
    projectId: "airjb-f1883",
    // ... other config
};
```

### GitHub API Integration

Download statistics are fetched from the GitHub API:
- Repository: `AirJBn/AirJB`
- Endpoint: `/repos/AirJBn/AirJB/releases`

## 📱 Responsive Design

The website is fully responsive with breakpoints at:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

## 🎨 Design System

### Typography
- **Font Family**: Josefin Sans
- **Font Weights**: 100, 200, 300, 400, 500, 600, 700
- **Primary Weight**: 200 (light)
- **Headings Weight**: 200-300

### Color Palette
- **Background**: #1a1a1a (dark)
- **Secondary**: #2d2d2d (medium dark)
- **Accent**: #00ff88 (green)
- **Text Primary**: #ffffff (white)
- **Text Secondary**: #cccccc (light gray)
- **Text Muted**: #888888 (gray)

### Components
- **Buttons**: Minimal border-style with hover effects
- **Cards**: Subtle borders with hover animations
- **Navigation**: Fixed header with backdrop blur

## 🔄 Updates and Maintenance

### Automatic Updates
- **Deployment**: Triggered on every push to main branch
- **Data Refresh**: Dashboard updates every 30 seconds
- **Download Stats**: Refreshed every 5 minutes

### Manual Updates
To update the website content:

1. Edit the relevant files (`index.html`, `styles.css`, `script.js`)
2. Commit and push changes to the main branch
3. GitHub Actions will automatically deploy the updates

## 📈 Analytics

The website includes custom analytics tracking:
- **Page Views**: Automatic tracking of page visits
- **User Interactions**: Button clicks and section views
- **Performance**: Load times and user engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test locally
5. Commit: `git commit -m "Add feature"`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the main AirJB repository for details.

## 🔗 Related Links

- **Main Application**: [AirJB Repository](https://github.com/AirJBn/AirJB)
- **Releases**: [Download AirJB](https://github.com/AirJBn/AirJB/releases)
- **Issues**: [Report Issues](https://github.com/AirJBn/AirJB/issues)

## 📞 Support

For support with the website or AirJB application:
- Create an issue in the main [AirJB repository](https://github.com/AirJBn/AirJB/issues)
- Use the support system within the AirJB application
- Contact through the website's support section

---

**AirJB** - Professional flight tracking for virtual pilots
