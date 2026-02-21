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

- **Dream Workflow**: AI-assisted dream capture with DeepSeek (V3.2) for conversational detail gathering and Google Nano Banana (Gemini) for dream image generation
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

## 🎨 Themes

DreamSpeak supports multiple themes powered by DaisyUI:

- Light, Dark, Cupcake, Emerald, and many more
- Theme selection persists across sessions
- Automatic system theme detection

## 🔧 Dream Workflow (Optional)

The Add Dream flow uses a conversational workflow powered by:

- **DeepSeek (deepseek-chat)**: Helps pull dream details through follow-up questions. Context caching automatically reduces costs for repeated prompts.
- **Google Nano Banana (Gemini 2.5 Flash Image)**: Generates dream images from your description via the [@google/genai](https://www.npmjs.com/package/@google/genai) SDK.

Add these to your `.env` to enable the workflow:

- `VITE_DEEPSEEK_API_KEY` – from [DeepSeek API](https://platform.deepseek.com)
- `VITE_GOOGLE_API_KEY` or `VITE_GEMINI_API_KEY` – from [Google AI Studio](https://aistudio.google.com/)

## 🔒 Privacy Features

DreamSpeak puts privacy first:

- **Dream Visibility**: Choose who can see your dreams (everyone, friends, or private)
- **Interaction Controls**: Control who can like, comment, and favorite your dreams
- **Anonymous Mode**: Post dreams without revealing your identity
- **Data Ownership**: Full control over your dream data
