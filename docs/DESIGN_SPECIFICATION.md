# NailGlow App - Complete Design Specification
*Version 1.0 - September 2025*

## 🎯 App Purpose
NailGlow allows users to virtually try on different nail colors and shapes using AI, helping them visualize how styles will look before visiting a nail salon.

## 📱 App Structure

### Bottom Tab Navigation (3 Tabs)
1. **Create** - Main feature for trying on nail styles
2. **My Looks** - Saved nail transformations
3. **Profile** - User account and settings

---

## 🎨 Complete User Flow

### 1. App Launch
- **New User:** Signup → Onboarding (4 steps) → Create Tab
- **Returning User:** Login → Create Tab
- **Logged In User:** Directly to Create Tab

### 2. Create Tab Flow

#### Step 1: Color Selection Screen
```
┌─────────────────────────────┐
│     Choose Your Color       │
├─────────────────────────────┤
│ [Recently Used Colors]      │ ← Horizontal scroll (if any)
│ ○ ○ ○ ○ ○                  │
├─────────────────────────────┤
│ ▼ Nudes & Naturals    (10)  │ ← Expandable category
│ ▼ Classic Reds        (7)   │
│ ▼ Burgundies & Wines  (7)   │
│ ▼ Pinks              (8)   │
│ ▼ Corals & Peaches   (6)   │
│ ▼ Oranges            (6)   │
│ ▼ Yellows & Golds    (6)   │
│ ▼ Greens             (9)   │
│ ▼ Blues              (9)   │
│ ▼ Purples & Violets  (8)   │
│ ▼ Browns & Taupes    (6)   │
│ ▼ Blacks & Grays     (7)   │
│ ▼ Whites & Creams    (7)   │
│ ▼ Metallics          (7)   │
│ ▼ Special Effects    (5)   │
├─────────────────────────────┤
│ [Continue - Disabled]       │ ← Enabled after selection
└─────────────────────────────┘
```

**Interaction Details:**
- Tap category to expand/collapse
- Each category shows color circles in a grid (3 per row)
- Selected color gets checkmark overlay
- Continue button activates once color selected

#### Step 2: Shape Selection Screen
```
┌─────────────────────────────┐
│     Choose Your Shape       │
├─────────────────────────────┤
│  Selected: Classic Red      │ ← Shows chosen color
├─────────────────────────────┤
│   ┌────┐      ┌────┐       │
│   │Round│     │Square│      │  
│   └────┘      └────┘       │
│                             │
│   ┌────┐      ┌────┐       │
│   │Oval │     │Almond│      │
│   └────┘      └────┘       │
│                             │
│   ┌────┐      ┌────┐       │
│   │Coffin│    │Stiletto│    │
│   └────┘      └────┘       │
├─────────────────────────────┤
│    [Continue to Camera]     │
└─────────────────────────────┘
```

**Interaction Details:**
- Large touch targets (full width/2)
- Visual representation of each shape
- Selected shape gets pink border
- Shows selected color at top for context

#### Step 3: Camera Screen
```
┌─────────────────────────────┐
│  Classic Red • Almond       │ ← Selected style chip
├─────────────────────────────┤
│                             │
│                             │
│      [Camera View]          │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  [Gallery] [Capture] [Flip] │
└─────────────────────────────┘
```

**Interaction Details:**
- Shows selected style at top
- Standard camera controls
- Gallery option for selecting existing photo

#### Step 4: Processing Animation
```
┌─────────────────────────────┐
│                             │
│   [Blurred nail photo]      │
│                             │
│   ━━━━━━━━━━━━━━━         │ ← Scanner line animation
│                             │
│        ╭──────╮             │
│        │  45% │             │ ← Circular progress
│        ╰──────╯             │
│                             │
│   "Applying Classic Red..." │ ← Rotating messages
│                             │
│   ✨ ✨ ✨ ✨ ✨            │ ← Floating sparkles
│                             │
└─────────────────────────────┘
```

**Animation Sequence:**
- Scanner line moves up/down continuously
- Progress percentage increments smoothly
- Text messages rotate based on progress:
  - 0-20%: "Analyzing your nails..."
  - 20-40%: "Applying [Color Name]..."
  - 40-60%: "Reshaping to [Shape]..."
  - 60-80%: "Perfecting the finish..."
  - 80-95%: "Almost ready..."
  - 95-100%: "Your look is ready!"

#### Step 5: Result Screen
```
┌─────────────────────────────┐
│         Your Look           │
├─────────────────────────────┤
│                             │
│                             │
│    [Transformed Image]      │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│  Classic Red • Almond       │
├─────────────────────────────┤
│ [Save to Collection]        │
│ [Try Another Color]         │
└─────────────────────────────┘
```

**Interaction Details:**
- Full screen image display
- Shows style details below image
- "Try Another Color" returns to Step 1 with same photo cached
- "Save" adds to My Looks with success feedback

---

## 📸 My Looks Tab

### Grid View
```
┌─────────────────────────────┐
│      My Looks               │
│                             │
│  [Compare]                  │ ← Compare mode button
├─────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐     │
│  │    │ │    │ │    │     │ ← 3 column grid
│  │    │ │    │ │    │     │
│  └────┘ └────┘ └────┘     │
│  Red•Alm Pink•Sq Blue•Ov   │ ← Labels under each
│                             │
│  ┌────┐ ┌────┐ ┌────┐     │
│  │    │ │    │ │    │     │
│  │    │ │    │ │    │     │
│  └────┘ └────┘ └────┘     │
└─────────────────────────────┘
```

**Interaction Details:**
- Instagram-style grid (3 columns)
- Each tile shows thumbnail + label
- Tap to view full screen
- Long press to delete (with confirmation)

### Compare Mode
```
┌─────────────────────────────┐
│    Compare (Select 2)       │
├─────────────────────────────┤
│  ☑️ Image 1   ☑️ Image 2    │ ← Selected items
│  ☐ Image 3   ☐ Image 4     │
├─────────────────────────────┤
│      [View Comparison]      │ ← Active when 2 selected
└─────────────────────────────┘
```

### Comparison View
```
┌─────────────────────────────┐
│        Comparison           │
├─────────────────────────────┤
│         │         │         │
│  Look 1 │    vs   │ Look 2  │ ← Split screen
│         │         │         │
│ Red•Alm │         │Pink•Sq  │
└─────────────────────────────┘
```

---

## 🎨 Complete Color Palette

### Categories and Colors

#### Nudes & Naturals (10)
- Bare, Beige, Taupe, Nude Pink, Cream, Sand, Buff, Chai, Cashmere, Oat

#### Classic Reds (7)
- Classic Red, Cherry, Crimson, Ruby, Scarlet, Vermillion, Candy Apple

#### Burgundies & Wines (7)
- Burgundy, Wine, Merlot, Bordeaux, Oxblood, Maroon, Sangria

#### Pinks (8)
- Baby Pink, Bubblegum, Hot Pink, Fuchsia, Magenta, Rose, Blush, Flamingo

#### Corals & Peaches (6)
- Coral, Salmon, Peach, Apricot, Cantaloupe, Terracotta

#### Oranges (6)
- Tangerine, Burnt Orange, Pumpkin, Amber, Rust, Copper Orange

#### Yellows & Golds (6)
- Lemon, Sunshine, Mustard, Honey, Butterscotch, Marigold

#### Greens (9)
- Mint, Sage, Olive, Forest, Emerald, Lime, Pistachio, Jade, Seafoam

#### Blues (9)
- Sky, Navy, Royal, Cobalt, Teal, Turquoise, Powder, Denim, Ocean

#### Purples & Violets (8)
- Lavender, Lilac, Violet, Plum, Eggplant, Orchid, Amethyst, Iris

#### Browns & Taupes (6)
- Chocolate, Espresso, Caramel, Mocha, Cinnamon, Tan

#### Blacks & Grays (7)
- Pure Black, Charcoal, Slate, Graphite, Smoke, Ash, Gunmetal

#### Whites & Creams (7)
- Pure White, Pearl, Ivory, Vanilla, Coconut, Milk, Opal

#### Metallics (7)
- Gold, Silver, Rose Gold, Bronze, Copper, Platinum, Chrome

#### Special Effects (5)
- Holographic, Iridescent, Color-Shift, Glitter Gold, Glitter Silver

**Total: 108 Colors**

---

## 🔄 State Management

### Persistent Data
- Last selected color/shape (for returning users)
- Recently used colors (last 5)
- Saved looks gallery
- User preferences

### Session Data
- Current photo (cached after capture)
- Selected color
- Selected shape
- Processing status

---

## ⚠️ Error States

### Camera Errors
- **No Permission:** "Please allow camera access in settings"
- **No Hand Detected:** "Please make sure your hand is clearly visible"
- **Poor Lighting:** "Try better lighting for best results"

### Processing Errors
- **Timeout:** "Taking longer than usual... Hold tight!"
- **Gemini Error:** "Oops! Let's try that again" [Retry]
- **Network Error:** "Check your connection and try again"

---

## 🎯 Gemini AI Prompt Structure

```
User has selected:
- Color: [Color Name] ([Hex Code])
- Shape: [Shape Name]

Please transform the nails in this image to:
1. Change nail polish color to exactly [Hex Code]
2. Reshape nails to [Shape] style
3. Keep the rest of the hand unchanged
4. Ensure professional, salon-quality appearance
5. Make the transformation look realistic and natural
```

---

## 📊 Technical Specifications

### Image Requirements
- Capture Quality: 0.8
- Format: JPEG
- Max Size: 5MB
- Include Base64 for Gemini processing

### Performance Targets
- Color selection: <100ms response
- Camera capture: <500ms
- Gemini processing: 5-15 seconds
- Image save: <1 second

### Storage Structure
```javascript
savedLook = {
  id: uuid,
  imageUrl: string,
  colorName: string,
  colorHex: string,
  shapeName: string,
  createdAt: timestamp,
  userId: string
}
```

---

## 🎨 Visual Design System

### Colors
- Primary: Hot Pink (#FF69B4)
- Secondary: Soft Pink (#FFE4E6)
- Background: White (#FFFFFF)
- Text Primary: Dark Gray (#333333)
- Text Secondary: Medium Gray (#666666)

### Typography
- Headers: Bold 24px
- Subheaders: Semibold 18px
- Body: Regular 16px
- Labels: Regular 12px

### Spacing
- Screen Padding: 20px
- Component Spacing: 16px
- Grid Gap: 10px

### Components
- Buttons: 50px height, 30px border radius
- Color Circles: 60px diameter
- Shape Cards: Full width, 80px height
- Image Thumbnails: Square, 3:4 aspect for full view

---

## 🔐 Data Flow

1. **Color Selection** → Store in state
2. **Shape Selection** → Store in state
3. **Photo Capture** → Cache locally + store Base64
4. **Send to Gemini** → Include color, shape, and image
5. **Receive Result** → Display transformed image
6. **Save** → Store in Supabase with metadata
7. **My Looks** → Fetch from Supabase, cache locally

---

This specification serves as the single source of truth for the NailGlow app design and functionality.