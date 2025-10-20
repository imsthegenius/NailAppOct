# CLAUDE.md - AI Development Guidelines & Instructions

## 🔄 GIT WORKFLOW & VERSION CONTROL

### Repository Information
**GitHub URL**: https://github.com/imsthegenius/nailapp.git  
**Main Branch**: `main`  
**Author**: Imraan Habib (@imsthegenius)  

### Commit Guidelines

#### Always follow this workflow:
```bash
# 1. Check current status
git status

# 2. Add changes
git add .  # Or specific files

# 3. Create descriptive commit
git commit -m "feat: Add social login with Apple and Google

- Implement Sign in with Apple
- Add Google OAuth integration
- Update login UI with social buttons
- Add proper error handling

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Push to GitHub
git push origin main
```

#### Commit Message Format:
```
<type>: <description>

[optional body with details]
- Bullet point 1
- Bullet point 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` UI/formatting changes
- `refactor:` Code restructuring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Branch Strategy

**For now:** Working directly on `main` branch  
**Future:** Will use feature branches

```bash
# Future feature branch workflow
git checkout -b feature/apple-login
# Make changes
git add .
git commit -m "feat: Implement Sign in with Apple"
git push origin feature/apple-login
# Then create PR on GitHub
```

### Important Git Rules

1. **ALWAYS commit before major changes**
2. **NEVER commit sensitive data** (.env files are gitignored)
3. **ALWAYS pull before starting work**: `git pull origin main`
4. **COMMIT frequently** - at least after each completed feature
5. **PUSH after every significant commit** to backup work

### Files to NEVER Commit
- `.env` (contains API keys)
- `node_modules/` (dependencies)
- `.expo/` (local Expo files)
- `*.log` (log files)
- iOS/Android build artifacts

### Co-Authorship
Always include in commit messages:
```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## IMPORTANT: File Path Rules

### SQL Files
**ALWAYS save SQL files to:** `/Users/imraan/Downloads/NailApp/nail-app/supabase/`
- Use sequential numbering (e.g., 09_mobile_app_updates.sql, 10_next_update.sql)
- Never save SQL files to the mobile app directory
- This is the single source of truth for all database changes

### Mobile App Files
**Mobile app code location:** `/Users/imraan/Downloads/NailApp/nail-app-mobile/`
- All React Native/Expo code goes here
- Screens, components, lib files, etc.

### Documentation Files
**Design documentation:** `/Users/imraan/Downloads/NailApp/docs/`
- DESIGN_SPECIFICATION.md and other docs go here

## 🎨 iOS 26 Liquid Glass Design System

### Core Design Principles
The entire app follows iOS 26's Liquid Glass aesthetic with these principles:

1. **Floating UI**: All UI elements float over content
2. **Glassmorphism**: Translucent, blurred backgrounds with subtle borders
3. **Minimalism**: Focus on content, minimal UI chrome
4. **Consistency**: Same design language throughout the app
5. **No Double Menus**: Single floating navigation system

### Glassmorphism Component Architecture

#### 1. Native iOS Module (`ios/LiquidGlassModule.swift`)
```swift
// Native iOS 26 UIGlassEffect implementation
// Provides authentic iOS system-level blur effects
// Uses UIVisualEffectView with systemUltraThinMaterial
// Includes vibrancy layers for true liquid glass appearance
```

#### 2. React Native Wrapper (`components/ui/NativeLiquidGlass.tsx`)
```typescript
// Smart component that:
// - Uses native iOS 26 UIGlassEffect when available
// - Falls back to expo-blur for Android/older iOS
// - Configurable: intensity (0-100), tint (light/dark/extraLight)
// - Corner radius and border width for glass edge effect
```

#### 3. Liquid Glass Tab Bar (`components/ui/LiquidGlassTabBar.tsx`)
```typescript
// Floating navigation bar with:
// - Position: 20px from bottom and sides
// - Height: 60px fixed
// - Auto-collapse with scale animation (not height)
// - Glass effect with 85% intensity
// - Smooth spring animations
```

### Implementation Standards

#### Glass Button Pattern
```typescript
// CORRECT - Icons visible inside glass
<NativeLiquidGlass style={styles.glassButton}>
  <TouchableOpacity onPress={onPress}>
    <Ionicons name={icon} size={24} color="white" />
  </TouchableOpacity>
</NativeLiquidGlass>

// WRONG - Icons hidden by incorrect layering
<TouchableOpacity>
  <NativeLiquidGlass>
    <Ionicons /> // This won't be visible
  </NativeLiquidGlass>
</TouchableOpacity>
```

#### Screen Layout Pattern
```typescript
// Every screen should follow this structure:
<View style={styles.container}>
  {/* Content */}
  <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
    {/* Main content here */}
  </ScrollView>
  
  {/* Floating Glass Tab Bar - ALWAYS at bottom */}
  <LiquidGlassTabBar
    tabs={[
      { icon: 'color-palette', label: 'Design', route: 'Design' },
      { icon: 'camera', label: 'Camera', route: 'Camera' },
      { icon: 'grid', label: 'Feed', route: 'Feed' },
    ]}
    activeTab="CurrentScreen"
    onTabPress={handleNavigation}
  />
</View>
```

### Color Palette
```typescript
const glassmorphismColors = {
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',    // Light glass overlay
    dark: 'rgba(0, 0, 0, 0.2)',           // Dark glass overlay
    border: 'rgba(255, 255, 255, 0.18)',  // Glass edge
  },
  text: {
    primary: '#FFFFFF',                    // White on glass
    secondary: 'rgba(255, 255, 255, 0.7)', // Muted white
    accent: '#FF69B4',                     // Pink accent
  },
  background: {
    primary: '#000000',                    // Pure black
    secondary: '#111111',                  // Near black
  }
};
```

### Animation Guidelines
```typescript
// ALWAYS use native driver for animations
const animationConfig = {
  useNativeDriver: true,  // Required for performance
  friction: 8,            // Spring friction
  tension: 40,            // Spring tension
};

// Use transform instead of layout properties
// CORRECT: transform: [{ scaleY }]
// WRONG: height: animatedHeight (not supported by native driver)
```

### Navigation Architecture
```typescript
// NO BOTTOM TAB NAVIGATOR - We use custom glass tab bar
// Simple stack navigator only:
<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Camera" component={CameraScreen} />
  <Stack.Screen name="Design" component={DesignScreen} />
  <Stack.Screen name="Feed" component={FeedScreen} />
  // ... other screens
</Stack.Navigator>
```

## Critical Rules for Glassmorphism

### NEVER DO
1. **NEVER** use React Navigation's bottom tabs - custom glass bar only
2. **NEVER** use solid backgrounds for UI controls
3. **NEVER** use height animations with native driver
4. **NEVER** place TouchableOpacity inside blur components
5. **NEVER** forget padding bottom (100px) for floating nav
6. **NEVER** use emojis as icons or in the UI - no emoji characters at all

### ALWAYS DO
1. **ALWAYS** use NativeLiquidGlass for glass effects
2. **ALWAYS** place interactive elements as children of glass
3. **ALWAYS** use transform animations with native driver
4. **ALWAYS** maintain consistent 20px margins for floating elements
5. **ALWAYS** use the same tab bar on all main screens

## 📱 Screen-Specific Implementations

### Camera Screen
- Top glass buttons: Close, Flash, Camera Flip
- No Photo/Video toggle (photos only)
- Floating capture controls
- Gallery and style buttons with subtle glass

### Design Screen
- Dark background (#000)
- Color categories with gradient previews
- Floating glass tab bar
- No bottom quick actions

### Feed Screen
- Grid layout with 100px bottom padding
- Floating glass tab bar
- Filter tabs at top (not glassmorphic)

### Results Screen
- Full-screen image background
- Minimal glass top bar with style info
- Floating glass action buttons
- Two-tier button layout (primary + secondary)

## 🔧 Troubleshooting Glassmorphism

### Issue: Icons not visible in glass buttons
**Solution**: Ensure TouchableOpacity wraps icon, not glass component

### Issue: Double navigation menus
**Solution**: Remove TabNavigator, use only Stack with custom tab bar

### Issue: Animation errors with height
**Solution**: Use scaleY transform instead of height property

### Issue: Glass effect not working on Android
**Solution**: NativeLiquidGlass automatically falls back to expo-blur

## Current Project Status

### Completed
- ✅ Native iOS glassmorphism module
- ✅ React Native glass wrapper component  
- ✅ Floating liquid glass tab bar
- ✅ Removed all old navigation
- ✅ Camera screen glass redesign
- ✅ Results screen minimalist redesign
- ✅ Consistent glassmorphism across all screens
- ✅ 108 colors in 15 categories defined
- ✅ 6 nail shapes defined

### Implementation Details

#### Native Module Structure
```
ios/
├── LiquidGlassModule.swift    # Native iOS implementation
├── LiquidGlassModule.m         # Objective-C bridge
└── nail-app-mobile-Bridging-Header.h  # Swift bridging
```

#### Component Structure  
```
components/ui/
├── NativeLiquidGlass.tsx      # Main glass component
├── LiquidGlassTabBar.tsx      # Floating navigation
└── GlassmorphicView.tsx       # Legacy (can be removed)
```

### Pending Implementation
- Create nail length selector with glassmorphism
- Add shape transformation to Gemini API
- Implement share functionality
- Add haptic feedback to all glass interactions

## Development Rules

1. **ALWAYS** check file paths before saving
2. **NEVER** create duplicate SQL files in wrong locations
3. **ALWAYS** use the correct project structure
4. **FOLLOW** the glassmorphism design system for ALL UI
5. **TEST** on both iOS and Android for glass effect fallbacks
6. **MAINTAIN** consistent floating UI paradigm
7. **NO EMOJIS** - Never use emoji characters in the UI, code, or as icons
8. **NEVER** use `let` for module-level exports - always use `const` to prevent re-evaluation issues during navigation
9. **NEVER** directly mutate shared state objects - ALWAYS use helper functions (`updateSelectedColor`, `updateSelectedNail`) to prevent crashes

## Component Usage Examples

### Creating a Glass Button
```typescript
import { NativeLiquidGlass } from '../components/ui/NativeLiquidGlass';

<NativeLiquidGlass
  style={styles.button}
  intensity={75}
  tint="light"
  cornerRadius={25}
>
  <TouchableOpacity style={styles.buttonContent} onPress={handlePress}>
    <Ionicons name="icon-name" size={24} color="white" />
    <Text style={styles.buttonText}>Button Text</Text>
  </TouchableOpacity>
</NativeLiquidGlass>
```

### Adding Glass Tab Bar to Screen
```typescript
import { LiquidGlassTabBar } from '../components/ui/LiquidGlassTabBar';

// At the bottom of your screen component
<LiquidGlassTabBar
  tabs={[
    { icon: 'color-palette', label: 'Design', route: 'Design' },
    { icon: 'camera', label: 'Camera', route: 'Camera' },
    { icon: 'grid', label: 'Feed', route: 'Feed' },
  ]}
  activeTab="CurrentScreenName"
  onTabPress={(route) => navigation.navigate(route)}
/>
```

### Creating Glass Card/Panel
```typescript
<NativeLiquidGlass
  style={styles.card}
  intensity={80}
  tint="dark"
  cornerRadius={20}
>
  <View style={styles.cardContent}>
    {/* Card content here */}
  </View>
</NativeLiquidGlass>
```

## 🚀 Future Glassmorphism Enhancements

1. **Dynamic Blur Intensity**: Based on scroll position
2. **Gesture-Responsive Glass**: Intensity changes with touch
3. **Animated Glass Transitions**: Morphing between states
4. **Context-Aware Tinting**: Adapts to background content
5. **Glass Particle Effects**: Subtle animations within glass

## ⚠️ Known Issues & Solutions

### Camera Crash on Navigation
**Problem**: Camera crashes when navigating from Design screen with selected values  
**Root Causes**: 
1. Using `let` for module-level exports causes module re-evaluation during navigation
2. Race condition when mutating module-level state and immediately navigating
3. Direct mutation of shared state objects instead of using helper functions

**Solutions**:
1. Always use `const` for exported objects in shared state modules
2. **ALWAYS use helper functions to update shared state - NEVER mutate directly**
3. Add delay after state updates before navigation to prevent race conditions

```typescript
// ❌ WRONG - Will cause crashes during navigation
export let selectedData = { color: null };

// ✅ CORRECT - Stable reference during navigation
export const selectedData = { color: null };
```

**CRITICAL: Always Use Helper Functions**:
```typescript
// ❌ WRONG - Direct mutation causes crashes
import { selectedColorData, selectedNailData } from '../lib/selectedData';

selectedColorData.color = newColor;  // NEVER DO THIS
selectedNailData.shape = newShape;   // NEVER DO THIS
navigation.navigate('Camera'); // Will crash!

// ✅ CORRECT - Use helper functions for ALL state updates
import { updateSelectedColor, updateSelectedNail } from '../lib/selectedData';

updateSelectedColor(newColor);  // ALWAYS use helpers
updateSelectedNail(newShape, newLength);  // ALWAYS use helpers
setTimeout(() => {
  navigation.navigate('Camera'); 
}, 100); // Delay prevents race condition
```

**Why Helper Functions Are Critical**:
- They provide controlled state updates
- They prevent race conditions
- They ensure consistency across the app
- They were created specifically to prevent crashes

**Rule #9**: **NEVER directly mutate shared state objects. ALWAYS use the provided helper functions (`updateSelectedColor`, `updateSelectedNail`). Direct mutations WILL cause crashes.**

---

**Remember**: Every UI element should feel like it's floating above the content with the iOS 26 Liquid Glass effect. This creates a layered, depth-rich interface that's both functional and beautiful.