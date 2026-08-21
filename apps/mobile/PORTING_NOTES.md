# MediaVault Android - React Native Port

Welcome to the React Native port of the MediaVault web application! This React Native app brings the media tracking functionality to Android devices using Expo.

## What's Been Ported

The following components and features from the web app have been successfully adapted to React Native:

### ✅ Core Features
- **User Authentication**: Login and registration screens with validation
- **User Context & State Management**: Auth state management using React Context
- **API Clients**: All backend API clients (Users, Media Entries, Movies, TV Series, Games, Books, Manga)
- **Type System**: Shared API DTOs and enum values from `@mediavault/contracts`, plus Android-local models
- **Media Entries Management**: View, search, and filter media entries by status and type

### ✅ Screens Implemented
1. **Login Screen** (`app/(auth)/index.tsx`)
   - Username/email and password login
   - Link to registration
   - Auth state persistence

2. **Registration Screen** (`app/(auth)/register.tsx`)
   - User account creation
   - Form validation
   - Confirmation fields for email and password

3. **Dashboard Screen** (`app/(dashboard)/index.tsx`)
   - View media entries grouped by status (OnGoing, Completed, Backlog, Dropped, Caught Up)
   - Filter by media type (Movies, Series, Books, Manga, Games)
   - Horizontal scrollable entry cards with images and ratings
   - Displays entry count per status section

4. **Search Screen** (`app/(dashboard)/search.tsx`)
   - Real-time search with debouncing (400ms delay)
   - Minimum 3 character search requirement
   - Displays search results as a list with images, titles, and ratings

5. **Profile Screen** (`app/(dashboard)/profile.tsx`)
   - Display current user information (username, email, join date)
   - Logout functionality

### ✅ Architecture
- **Expo Router**: File-based routing with protected routes (auth vs. dashboard)
- **React Context API**: User authentication state management
- **TypeScript**: Full type safety throughout the app
- **React Native Core Components**: ScrollView, FlatList, TextInput, TouchableOpacity, etc.

## Setup & Configuration

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo Go app (for testing on device)
- Android device or emulator (for full testing)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Update .env.local with your backend API URL
# EXPO_PUBLIC_MEDIA_VAULT_API_URL=http://your-backend-url:5210
```

### Running the App
```bash
# Start the development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS (if on Mac)
npm run ios

# Run on web
npm run web
```

## API Configuration

The app communicates with a MediaVault backend API. Configure the API URL in `.env.local`:

```env
EXPO_PUBLIC_MEDIA_VAULT_API_URL=http://localhost:5210
```

The API base URL should point to your running MediaVault backend server.

## File Structure

```
app/
├── (auth)/                      # Auth group routes
│   ├── _layout.tsx             # Auth layout with redirects
│   ├── index.tsx               # Login screen
│   └── register.tsx            # Registration screen
├── (dashboard)/                # Dashboard group routes (protected)
│   ├── _layout.tsx             # Dashboard layout with tabs
│   ├── index.tsx               # Dashboard/home screen
│   ├── search.tsx              # Search screen
│   └── profile.tsx             # Profile screen
├── _layout.tsx                 # Root layout with UserProvider
├── clients/                    # API client classes
│   ├── UsersClient.ts
│   ├── MediaEntriesClient.ts
│   ├── MovieEntriesClient.ts
│   ├── TvSeriesEntriesClient.ts
│   ├── GameEntriesClient.ts
│   ├── BookEntriesClient.ts
│   └── MangaEntriesClient.ts
└── shared/                     # Shared utilities
    ├── UserContext.tsx         # Auth context and hook
    └── mediaConstants.ts       # Status and media type constants
```

## What's Different from the Web App

### Styling
- **Web**: Tailwind CSS with `@apply` directives
- **Native**: React Native's `StyleSheet` and inline styles (prepared for NativeWind if needed)

### Navigation
- **Web**: React Router with client-side routing
- **Native**: Expo Router with file-based routing and protected route groups

### Components
- **Web**: HTML elements (div, button, input, img, etc.)
- **Native**: React Native components (View, TouchableOpacity, TextInput, Image, etc.)

### Forms
- **Web**: HTML forms with browser-native validation
- **Native**: Custom form handling with Alert dialogs for validation feedback

### HTTP Requests
- **Web**: Fetch API with browser credentials handling
- **Native**: Fetch API with explicit credentials configuration (no cookies/session storage by default)

## State Management

The app uses **React Context API** for authentication state:

```typescript
const { 
  currentUser,           // Current logged-in user object
  authenticationStatus, // restoring | authenticated | unauthenticated
  isAuthenticated,       // Boolean auth status
  isLoading,             // Compatibility flag for the restoring state
  login,                 // Async login function
  logout,                // Async logout function
  refreshCurrentUser    // Refresh user data from server
} = useUser();
```

The route-group guards wait while the session is restoring. Authenticated
`401` responses and logout both clear SecureStore and the in-memory user through
the centralized session lifecycle; transition identities prevent late startup
or login responses from restoring stale state.

## Known Limitations & Future Enhancements

### Current Limitations
1. **Create/Edit Modal**: Not yet implemented for adding/editing media entries
2. **Search Results**: View-only, cannot tap to edit entries
3. **Media Details**: Limited display of detailed entry information
4. **Image Handling**: No image selection/upload for creating entries
5. **Offline Support**: No offline caching or sync

### Future Enhancements
- [ ] Media entry creation/editing modal
- [ ] Detailed entry view with all metadata
- [ ] Add to list/collection functionality
- [ ] Image upload from camera or gallery
- [ ] Offline support with local storage
- [ ] Dark mode theme
- [ ] Tab navigation UI styling
- [ ] Persistent storage (AsyncStorage)
- [ ] Push notifications

## Testing

The app has been validated with:
- ✅ TypeScript compilation (no errors)
- ✅ ESLint code quality checks (no errors)
- ✅ All routes and screens render
- ✅ Navigation flow between auth and dashboard
- ✅ API client integration ready

## Troubleshooting

### App not starting
- Clear Expo cache: `expo r -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### API connection issues
- Verify `.env.local` has the correct `EXPO_PUBLIC_MEDIA_VAULT_API_URL`
- Ensure backend API is running and accessible
- Check network connectivity (for device testing)

### TypeScript errors
- Run `npm run typecheck:mobile` to check for compilation errors
- Import API DTOs and enum values from `@mediavault/contracts`; use relative paths for app-local modules

## Environment Variables

### Available Variables
```env
EXPO_PUBLIC_MEDIA_VAULT_API_URL    # Backend API base URL (required)
```

Note: All `EXPO_PUBLIC_*` prefixed variables are available in the client code.

## Contributing

When making changes:
1. Ensure TypeScript compiles: `npm run typecheck:mobile`
2. Run linter: `npm run lint`
3. Test on physical device or emulator

## License

This is a port of the MediaVault web application to React Native for Android devices.
