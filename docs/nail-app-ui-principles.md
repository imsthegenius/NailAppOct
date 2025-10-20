# Nail Try-On App Minimalist UI Design Principles

Based on the mobile-first nail try-on experience, here are the specific design principles that should be applied across all screens for a consistent, elegant, and beauty-focused aesthetic:

## Typography

1. **Hierarchy is key**:
   - Display text (32px) for main headings (e.g., "Try New Colors")
   - Large text (24px) for section headers (e.g., "Popular Shades")
   - Regular text (16px) for body text and labels
   - Small text (14px) for supporting information and hints
   - Tiny text (12px) for metadata and timestamps

2. **Font weights**:
   - Light (300) for elegant display text
   - Regular (400) for body text and descriptions
   - Medium (500) for buttons and interactive elements
   - Semibold (600) for emphasis and product names
   - Use Inter, SF Pro, or Poppins as the primary font family

## Colors

1. **Minimalist palette**:
   - **Primary background**: Pure white (#FFFFFF)
   - **Secondary background**: Soft blush (#FFF5F7)
   - **Tertiary background**: Light gray (#F8F8FA)
   - **Text**: Deep charcoal (#1A1A1A) for primary, Medium gray (#6B6B6B) for secondary
   - **Accent**: Rose gold (#E8B4B8) for primary actions
   - **Secondary accent**: Soft mauve (#C89FA3) for selected states

2. **UI state colors**:
   - Active/Selected: Rose gold (#E8B4B8)
   - Processing: Soft purple (#B8A6DB)
   - Success: Mint green (#A8D5BA)
   - Error: Soft coral (#FFB5B5)
   - Disabled: Light gray (#E0E0E0)

3. **Shadow palette**:
   - Soft shadow: 0 2px 8px rgba(0, 0, 0, 0.04)
   - Medium shadow: 0 4px 16px rgba(0, 0, 0, 0.08)
   - Elevated shadow: 0 8px 24px rgba(0, 0, 0, 0.12)

## Spacing & Layout

1. **Card structure**:
   - Large border radius (20px) for image cards
   - Medium border radius (16px) for content cards
   - Small border radius (12px) for buttons and chips
   - Consistent padding (20px for main cards, 16px for compact cards)
   - Soft shadows for depth hierarchy

2. **Vertical rhythm**:
   - 24px spacing between major sections
   - 16px spacing between related groups
   - 12px spacing between list items
   - 8px spacing between inline elements

3. **Grid system**:
   - 16px side margins on mobile
   - 2-column grid for color swatches
   - 3-column grid for nail shape options
   - Single column for image displays

## UI Elements

1. **Image containers**:
   - 16:9 aspect ratio for hand photos
   - Rounded corners (16px) with subtle shadow
   - Placeholder with hand icon and dashed border
   - Loading skeleton with shimmer effect

2. **Color picker**:
   - Circular swatches (48px diameter) with 2px white border
   - Active swatch with 3px rose gold border
   - Horizontal scrollable list for preset colors
   - Custom color button with gradient border

3. **Camera interface**:
   - Full-screen capture mode
   - Semi-transparent hand guide overlay
   - Capture button (72px) with white ring
   - Switch camera and flash toggle icons (40px)

4. **Progress indicators**:
   - Stepped progress bar for multi-step processes
   - Circular spinner with gradient animation
   - Percentage text for upload progress
   - Pulsing dots for AI processing

## Navigation

1. **Bottom navigation**:
   - 4 main tabs: Home, Try On, Gallery, Profile
   - Icon (24px) + label format
   - Active state with rose gold color
   - Inactive state with gray (#999999)
   - Subtle top border (1px #F0F0F0)

2. **Top app bar**:
   - Transparent background with blur effect
   - Back arrow for navigation
   - Title centered when no actions
   - Action icons right-aligned (share, favorite)

3. **Tab navigation**:
   - Segmented control for view modes
   - Rounded background (#F8F8FA)
   - Active segment with white background
   - Smooth sliding animation

## Content Cards

1. **Try-on result card**:
   - Large image preview (full width)
   - Before/after toggle or slider
   - Color name and brand below
   - Action buttons (Save, Share, Try Another)

2. **Color swatch card**:
   - Color circle with subtle shadow
   - Color name below (14px, medium weight)
   - Brand name (12px, regular, gray)
   - Tap to select interaction

3. **History item card**:
   - Thumbnail image (80px) on left
   - Color details in middle
   - Date and actions on right
   - Swipe to delete gesture

4. **Product card**:
   - Product image with rounded corners
   - Brand logo (if available)
   - Product name and shade
   - Price and "Shop Now" button

## Action Patterns

1. **Bottom sheet**:
   - Drag handle indicator
   - White background with top rounded corners
   - Smooth slide-up animation
   - Backdrop with 50% black opacity

2. **Floating action button**:
   - Rose gold gradient background
   - Camera icon (24px) in white
   - Fixed position (bottom: 24px, right: 24px)
   - Subtle shadow with press animation

3. **Image comparison**:
   - Slider handle with arrows
   - Before/after labels (semi-transparent)
   - Tap to toggle option
   - Pinch to zoom support

4. **Color selection feedback**:
   - Haptic feedback on selection
   - Brief scale animation (1.1x)
   - Checkmark overlay for selected
   - Smooth color transition preview

## Loading & Empty States

1. **Loading states**:
   - Skeleton screens matching content layout
   - Shimmer effect from left to right
   - Progressive image loading with blur-up
   - Meaningful loading messages

2. **Empty states**:
   - Centered illustration or icon
   - Clear, encouraging message
   - Primary action button
   - Soft background color (#FFF5F7)

3. **Error states**:
   - Friendly error illustration
   - Plain language error message
   - Retry button or alternative action
   - Maintain positive tone

## Mobile-Specific Patterns

1. **Touch targets**:
   - Minimum 44px height for buttons
   - 48px for primary actions
   - Adequate spacing between targets
   - Visual feedback on touch

2. **Gestures**:
   - Swipe between before/after
   - Pinch to zoom on images
   - Long press for options
   - Pull to refresh on galleries

3. **Orientation**:
   - Optimize for portrait mode
   - Lock orientation during camera
   - Responsive layout for landscape
   - Maintain aspect ratios

## Implementation Tips

1. Use `backdrop-filter: blur(10px);` for glass morphism effects on overlays
2. Implement `border-radius: 20px 20px 0 0;` for bottom sheets
3. Apply `box-shadow: 0 2px 8px rgba(232, 180, 184, 0.25);` for rose gold elements
4. Use `aspect-ratio: 16 / 9;` for consistent image containers
5. Implement smooth transitions with `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`
6. Position FAB with `position: fixed; bottom: 24px; right: 24px; z-index: 1000;`
7. Use `overscroll-behavior-y: contain;` to prevent pull-to-refresh conflicts
8. Apply `-webkit-touch-callout: none;` to prevent image save dialog on long press
9. Implement `scroll-snap-type: x mandatory;` for horizontal color picker scrolling
10. Use CSS variables for consistent color theming throughout the app

## Accessibility Considerations

1. **Color contrast**:
   - Minimum 4.5:1 for normal text
   - 3:1 for large text and icons
   - Visible focus indicators

2. **Touch accessibility**:
   - 44px minimum touch targets
   - Adequate spacing between elements
   - Clear visual feedback

3. **Screen reader support**:
   - Descriptive labels for all images
   - Aria labels for icon buttons
   - Semantic HTML structure

By consistently applying these principles across all screens, you'll create an elegant, user-friendly nail try-on experience that feels premium while remaining accessible and performant on mobile devices.