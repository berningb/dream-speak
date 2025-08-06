# DreamSpeak 🌙✨

A beautiful, modern web application for sharing and exploring dreams with a supportive community.

## 🚀 Live Demo

- **Production Site**: [https://dream-speak.web.app](https://dream-speak.web.app)
- **GitHub Repository**: [https://github.com/berningb/dream-speak.git](https://github.com/berningb/dream-speak.git)

## ✨ Features

### 🔐 Authentication & Privacy

- **Google Sign-In**: Seamless authentication with Firebase Auth
- **Privacy Settings**: Control who can see, like, comment, and favorite your dreams
- **Anonymous Mode**: Post dreams anonymously while maintaining privacy control

### 📝 Dream Management

- **Create Dreams**: Rich dream logging with titles, content, moods, and tags
- **Edit Dreams**: Update your dreams anytime with full editing capabilities
- **Dream Gallery**: Beautiful card-based display of all your dreams
- **Image Support**: Add images to enhance your dream descriptions

### 🌍 Community Features

- **Explore Dreams**: Discover dreams from the community
- **Interactive Comments**: Full comment system with edit and delete functionality
- **Likes & Favorites**: Express appreciation and save dreams for later
- **Real-time Updates**: Live updates when others interact with your dreams

### 📊 Analytics & Insights

- **Dream Analytics**: Visualize your dream patterns and moods over time
- **Favorites Management**: Organized view of all your favorited dreams
- **Personal Notes**: Add private notes to your dreams for reflection

### 🎨 User Experience

- **Modern UI**: Built with DaisyUI and TailwindCSS for a beautiful interface
- **Dark/Light Themes**: Multiple theme options for comfortable viewing
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Fast Performance**: Optimized with Vite for lightning-fast loading

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS + DaisyUI
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **Icons**: React Icons + Custom SVG icons
- **Charts**: Recharts for analytics visualization
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/berningb/dream-speak.git
   cd dream-speak
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up Firebase**:

   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Enable Hosting
   - Copy your Firebase config to `src/firebase.js`

4. **Start development server**:

   ```bash
   npm run dev
   ```

   The app will open at `https://localhost:3000`

## 📁 Project Structure

```
dream-speak/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AddDreamModal.jsx
│   │   ├── EditDreamModal.jsx
│   │   ├── DreamCard.jsx
│   │   ├── Comments.jsx
│   │   ├── Layout.jsx
│   │   ├── Menu.jsx
│   │   └── PrivacySettings.jsx
│   ├── contexts/           # React contexts
│   │   └── FirebaseAuthContext.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useApi.js
│   │   ├── useDreams.js
│   │   ├── useFavorites.js
│   │   └── useUsers.jsx
│   ├── pages/              # Main application pages
│   │   ├── Home/
│   │   ├── Explore/
│   │   ├── Dream/
│   │   ├── MyDreams/
│   │   ├── Reflections/
│   │   ├── Connections/
│   │   └── Settings/
│   ├── services/           # External service integrations
│   │   └── firebaseService.js
│   ├── firebase.js         # Firebase configuration
│   ├── utils.js           # Utility functions
│   └── main.jsx           # Application entry point
├── public/                 # Static assets
├── dist/                  # Build output
└── firebase.json          # Firebase hosting config
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
firebase deploy --only hosting
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI

## 🎨 Themes

DreamSpeak supports multiple themes powered by DaisyUI:

- Light, Dark, Cupcake, Emerald, and many more
- Theme selection persists across sessions
- Automatic system theme detection

## 🔒 Privacy Features

DreamSpeak puts privacy first:

- **Dream Visibility**: Choose who can see your dreams (everyone, friends, or private)
- **Interaction Controls**: Control who can like, comment, and favorite your dreams
- **Anonymous Mode**: Post dreams without revealing your identity
- **Data Ownership**: Full control over your dream data

## 🐛 Recent Updates

### v2.0.0 - Comments System Overhaul

- ✅ **Edit Comments**: Users can now edit their own comments inline
- ✅ **Delete Comments**: Full deletion functionality with proper permissions
- ✅ **Visual Indicators**: Shows "(edited)" for modified comments
- ✅ **Permission System**: Smart permissions (users edit own, owners moderate all)
- ✅ **UI Improvements**: Beautiful edit/delete icons with hover states
- ✅ **Keyboard Shortcuts**: Enter to save, Escape to cancel editing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with ❤️ using React and Firebase
- UI components powered by DaisyUI
- Icons from React Icons
- Charts by Recharts

---

**Sweet Dreams! 🌙** Start sharing your dreams at [dream-speak.web.app](https://dream-speak.web.app)
