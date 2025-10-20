# 💅 NailGlow - AI-Powered Nail Art Visualization

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_2.5-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</div>

## 📱 Overview

NailGlow is a cutting-edge mobile application that uses AI to help users visualize different nail polish colors and shapes on their own nails. Simply take a photo of your hand, select from 108 colors and 7 nail shapes, and see instant AI-powered transformations.

## ✨ Features

### Core Functionality
- 📸 **Camera Integration** - Capture photos of your nails or select from gallery
- 🎨 **108 Premium Colors** - Organized in 15 curated categories
- 💅 **7 Nail Shapes** - From natural to stiletto
- 🤖 **AI Transformation** - Powered by Google Gemini 2.5 Flash
- 💾 **Save & Share** - Store your favorite looks
- 📱 **iOS 26 Design** - Liquid Glass aesthetic with glassmorphism

### Technical Highlights
- **Real-time Processing** - See your nail transformation in seconds
- **Secure Authentication** - Powered by Supabase
- **Cloud Storage** - All your looks saved securely
- **Offline Support** - Browse saved looks without connection
- **Optimized Performance** - 60fps animations, <2s load time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Expo Go app (physical device)
- Supabase account (for backend)
- Google Cloud account (for Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imsthegenius/nailapp.git
   cd nailapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your keys:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app for physical device

## 🏗️ Architecture

```
nail-app-mobile/
├── screens/               # App screens
│   ├── CameraScreen.tsx   # Photo capture
│   ├── DesignScreen.tsx   # Color/shape selection
│   ├── ProcessingScreen.tsx # AI transformation
│   └── ResultsScreen.tsx  # Final result display
├── components/ui/         # Reusable UI components
│   ├── NativeLiquidGlass.tsx # iOS 26 glassmorphism
│   └── LiquidGlassTabBar.tsx # Floating navigation
├── lib/                   # Core services
│   ├── geminiService.ts   # AI integration
│   ├── supabase.ts        # Backend connection
│   └── supabaseStorage.ts # Image storage
├── navigation/            # App navigation
└── ios/                   # Native iOS modules
    └── LiquidGlassModule.swift # Native blur effects
```

## 🎨 Design System

The app follows iOS 26's Liquid Glass design principles:
- **Glassmorphism** - Translucent, blurred backgrounds
- **Floating UI** - All elements float above content
- **Minimalism** - Focus on content, minimal chrome
- **Smooth Animations** - 60fps spring animations

## 🔧 Technology Stack

- **Frontend**: React Native + Expo SDK 51
- **Language**: TypeScript
- **Styling**: Native StyleSheet + Custom Components
- **State**: React Hooks + Context
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini 2.5 Flash
- **Storage**: Supabase Storage
- **Navigation**: React Navigation v6

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>Camera</strong><br>
        <img src="docs/screenshots/camera.png" width="200" alt="Camera Screen"/>
      </td>
      <td align="center">
        <strong>Design</strong><br>
        <img src="docs/screenshots/design.png" width="200" alt="Design Screen"/>
      </td>
      <td align="center">
        <strong>Processing</strong><br>
        <img src="docs/screenshots/processing.png" width="200" alt="Processing Screen"/>
      </td>
      <td align="center">
        <strong>Results</strong><br>
        <img src="docs/screenshots/results.png" width="200" alt="Results Screen"/>
      </td>
    </tr>
  </table>
</div>

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📱 Deployment

### TestFlight (iOS)
1. Build for production: `expo build:ios`
2. Upload to App Store Connect
3. Submit for TestFlight review

### App Store
See [APPLE_COMPLIANCE.md](docs/APPLE_COMPLIANCE.md) for submission checklist

## 🔒 Security

- Authentication tokens stored in iOS Keychain (not AsyncStorage)
- All API calls use HTTPS/TLS 1.3
- User data encrypted at rest
- Privacy-first design (minimal data collection)
- GDPR/CCPA compliant

## 📄 Documentation

- [Apple Compliance Guide](docs/APPLE_COMPLIANCE.md) - App Store requirements
- [Claude AI Instructions](CLAUDE.md) - Development guidelines
- [Supabase Setup](SUPABASE_SETUP.md) - Backend configuration
- [Design Specification](docs/DESIGN_SPECIFICATION.md) - UI/UX details

## 🤝 Contributing

This is a private repository. For access or contributions, please contact the repository owner.

## 📝 License

Proprietary - All Rights Reserved

## 👤 Author

**Imraan Habib**
- GitHub: [@imsthegenius](https://github.com/imsthegenius)

## 🙏 Acknowledgments

- Google Gemini team for AI capabilities
- Supabase for backend infrastructure
- Expo team for React Native tooling
- Apple for iOS 26 design inspiration

## 📊 Project Status

**Current Version**: 1.0.0 (MVP)

**Phase 1** ✅ - Core Features (Complete)
- Camera integration
- Color/shape selection
- AI transformation
- Save functionality

**Phase 2** 🚧 - Apple Compliance (In Progress)
- Keychain storage
- Privacy policy
- Account deletion
- Social login (Apple & Google)

**Phase 3** 📅 - Enhancements (Planned)
- Face ID/Touch ID
- Offline mode
- Sharing features
- Nail art patterns

---

<div align="center">
  Made with 💅 and 🤖 by NailGlow Team
</div>