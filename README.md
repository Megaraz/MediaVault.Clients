# MediaVault Android - React Native App

A React Native port of the MediaVault web application for Android devices, built with Expo.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo Go app (for testing)
- Android device or emulator

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Update API URL in .env.local (if needed)
# EXPO_PUBLIC_API_URL=http://localhost:5000

# 4. Start the development server
npm start

# 5. Choose how to run:
# - Press 'a' for Android emulator/device
# - Press 'i' for iOS simulator (Mac only)
# - Press 'w' for web browser
# - Scan QR code with Expo Go app
```

## 📱 Features

### ✅ Implemented
- **Authentication**: Login, registration, and session management
- **Dashboard**: View media entries organized by status
- **Search**: Real-time search with debouncing
- **Filtering**: Filter by media type (Movies, Series, Books, Manga, Games)
- **Profile**: User profile and logout
- **Type Safety**: Full TypeScript support throughout
- **Protected Routes**: Auth-protected navigation

### 📋 Status Organization
Media entries are automatically organized by:
- **On Going**: Currently watching/reading/playing
- **Completed**: Finished consuming
- **Caught Up**: Latest episodes watched
- **Dropped**: Abandoned
- **Backlog**: In queue/wishlist

## 📚 Project Structure

```
app/
├── (auth)/                    # Authentication routes
│   ├── index.tsx             # Login screen
│   ├── register.tsx          # Registration screen
│   └── _layout.tsx           # Auth layout
│
├── (dashboard)/              # Protected dashboard routes
│   ├── index.tsx             # Dashboard/home screen
│   ├── search.tsx            # Search screen
│   ├── profile.tsx           # Profile screen
│   └── _layout.tsx           # Dashboard layout
│
├── clients/                  # API client classes
│   ├── UsersClient.ts
│   ├── MediaEntriesClient.ts
│   ├── MovieEntriesClient.ts
│   ├── TvSeriesEntriesClient.ts
│   ├── GameEntriesClient.ts
│   ├── BookEntriesClient.ts
│   └── MangaEntriesClient.ts
│
├── types/dtos/              # TypeScript type definitions
│   ├── MediaEntryBase.ts
│   ├── MovieEntry.ts
│   ├── TvSeriesEntry.ts
│   ├── GameEntry.ts
│   ├── BookEntry.ts
│   ├── MangaEntry.ts
│   └── Season.ts
│
├── shared/                  # Shared utilities
│   ├── UserContext.tsx      # Auth state management
│   └── mediaConstants.ts    # Status and type constants
│
└── _layout.tsx             # Root layout with providers
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
EXPO_PUBLIC_API_URL=http://your-backend-api-url:5000
# Set to true to initialize and enable the client-side SQLite database path.
EXPO_PUBLIC_USE_CLIENT_DATABASE=false
```

## 📝 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Build and run on Android
npm run ios           # Build and run on iOS (Mac only)
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint

# Type Checking (manual)
npx tsc --noEmit      # Check TypeScript compilation
```

## 🔐 Authentication

The app implements a complete auth flow:

1. **Login Screen**: Enter credentials
2. **Registration**: Create new account with validation
3. **Auth State**: Persisted via React Context
4. **Auto-load**: Current user loaded on startup
5. **Protected Routes**: Dashboard only accessible when authenticated

## 🎨 Styling

The app uses React Native's StyleSheet and inline styles. Future enhancements can include:
- NativeWind for Tailwind CSS support
- Dark mode theming
- Custom theme system

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
expo r -c
rm -rf node_modules
npm install
```

### API connection issues
- Check `.env.local` has correct `EXPO_PUBLIC_API_URL`
- Ensure backend API is running: `http://your-url/api/health`
- For device: use IP address instead of localhost

### TypeScript errors
```bash
# Check compilation
npx tsc --noEmit
```

## 📖 Documentation

- **[PORTING_NOTES.md](./PORTING_NOTES.md)** - Detailed porting notes and architecture
- **[PORT_SUMMARY.md](./PORT_SUMMARY.md)** - Summary of what was ported
- **[Expo Documentation](https://docs.expo.dev/)** - Expo framework docs
- **[React Native Docs](https://reactnative.dev/)** - React Native components & API

## 🚧 Not Yet Implemented

- Media entry creation/editing
- Entry detail view
- Image upload
- Offline support
- Dark mode
- Advanced filtering/sorting
- Statistics and analytics
- Social features

## 🤝 Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before proposing work. Focused
contributions are welcome after issue-first discussion.

## 📄 License

This repository is available under the [MIT License](LICENSE).

## Repository policies

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security](SECURITY.md)

---

**Last Updated**: June 28, 2026
**Expo Version**: ~54.0.0
**React Native Version**: 0.81.5
**Status**: ✅ Core features ported, ready for enhancement
