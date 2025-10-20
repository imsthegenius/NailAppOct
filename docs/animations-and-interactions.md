# ✨ Nail App Animations & Micro-Interactions Guide

## Overview

This document details all animations, transitions, and micro-interactions that create a delightful, premium user experience. Every interaction should feel smooth, intentional, and celebratory.

## 🎬 Core Animation Principles

### Design Philosophy
- **Purposeful**: Every animation has meaning, not just decoration
- **Smooth**: 60fps performance on all devices
- **Delightful**: Small surprises that make users smile
- **Consistent**: Unified timing and easing functions
- **Accessible**: Respect reduced-motion preferences

### Global Animation Settings

```css
:root {
  /* Timing */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
  
  /* Easing Functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0.0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📱 Onboarding Animations

### Splash Screen

```javascript
const SplashAnimation = {
  sequence: [
    {
      element: "logo",
      animation: "fadeIn + scaleUp",
      duration: 600,
      delay: 0,
      easing: "ease-out"
    },
    {
      element: "nailPolishBottle",
      animation: "slideInBottom + rotate",
      duration: 800,
      delay: 300,
      easing: "ease-spring"
    },
    {
      element: "colorDrip",
      animation: "drip down from bottle",
      duration: 1000,
      delay: 800,
      easing: "ease-in"
    },
    {
      element: "appName",
      animation: "shimmer text reveal",
      duration: 1200,
      delay: 1000,
      easing: "ease-out"
    }
  ]
};
```

### Welcome Slides

```css
/* Slide transitions */
.slide-enter {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 400ms var(--ease-out);
}

/* Parallax elements */
.parallax-element {
  transform: translateX(var(--parallax-offset));
  transition: transform 600ms var(--ease-out);
}

/* Floating nail polish bottles */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
```

## 📸 Camera Interface Animations

### Camera Overlay Entrance

```javascript
const CameraOverlayAnimations = {
  // Hand guide appearance
  handGuide: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 0.3, 
      scale: 1,
      transition: {
        duration: 500,
        ease: "easeOut"
      }
    },
    pulse: {
      scale: [1, 1.02, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        duration: 2000,
        repeat: Infinity
      }
    }
  },
  
  // Corner brackets draw-in
  cornerBrackets: {
    animation: "drawCorners 800ms ease-out forwards",
    svg: {
      strokeDasharray: 100,
      strokeDashoffset: 100,
      animate: { strokeDashoffset: 0 }
    }
  },
  
  // Instruction bubble
  instructionBubble: {
    initial: { y: -20, opacity: 0, scale: 0.9 },
    animate: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: {
        delay: 300,
        duration: 400,
        ease: "easeSpring"
      }
    }
  }
};
```

### Capture Button Interactions

```css
/* Capture button base */
.capture-button {
  position: relative;
  width: 72px;
  height: 72px;
  transition: all 200ms var(--ease-out);
}

/* Hover state */
.capture-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 30px rgba(232, 180, 184, 0.5);
}

/* Press animation */
.capture-button:active {
  transform: scale(0.95);
  transition-duration: 100ms;
}

/* Ready state pulse */
.capture-button.ready::before {
  content: '';
  position: absolute;
  inset: -10px;
  border: 2px solid var(--rose-gold);
  border-radius: 50%;
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* Capture flash effect */
@keyframes camera-flash {
  0% { opacity: 0; }
  50% { opacity: 1; background: white; }
  100% { opacity: 0; }
}
```

### Hand Detection Feedback

```javascript
const HandDetectionFeedback = {
  // When hand is detected
  onDetection: {
    haptic: "light",
    visual: {
      guide: "change color to green",
      checkmark: "fade in with scale",
      message: "update to 'Perfect!'"
    },
    animation: {
      duration: 300,
      ease: "easeOut"
    }
  },
  
  // Auto-capture countdown
  countdown: {
    numbers: {
      animation: "scale + fade",
      duration: 1000,
      sequence: ["3", "2", "1", "✨"]
    },
    background: {
      animation: "radial pulse",
      color: "rgba(232, 180, 184, 0.1)"
    }
  }
};
```

## 🎨 Color Selection Animations

### Color Swatch Interactions

```css
/* Color swatch hover */
.color-swatch {
  transition: all 200ms var(--ease-out);
  cursor: pointer;
}

.color-swatch:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Selection animation */
.color-swatch.selected {
  animation: select-bounce 400ms var(--ease-bounce);
}

@keyframes select-bounce {
  0% { transform: scale(1); }
  40% { transform: scale(1.3); }
  60% { transform: scale(0.9); }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Ripple effect on selection */
.color-swatch::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, transparent, currentColor);
  opacity: 0;
  transform: scale(0);
  transition: all 400ms var(--ease-out);
}

.color-swatch.selected::after {
  opacity: 0.3;
  transform: scale(2);
  animation: ripple-out 600ms ease-out;
}
```

### Tab Transitions

```javascript
const TabAnimations = {
  // Tab indicator slide
  indicator: {
    transition: "transform 300ms ease-out",
    willChange: "transform"
  },
  
  // Content change
  content: {
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 200 }
    },
    enter: {
      opacity: 1,
      x: 0,
      transition: { duration: 300, delay: 100 }
    }
  }
};
```

### Mood Selector Animation

```css
/* Mood card hover */
.mood-card {
  transition: all 300ms var(--ease-out);
  transform-style: preserve-3d;
}

.mood-card:hover {
  transform: rotateY(5deg) translateZ(10px);
}

/* Emoji animation */
.mood-emoji {
  display: inline-block;
  animation: emoji-bounce 2s ease-in-out infinite;
  animation-delay: calc(var(--index) * 100ms);
}

@keyframes emoji-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

## 🔄 Loading Animation Sequences

### Main Loading Animation

```javascript
const LoadingStages = {
  // Stage 1: Bottle shake
  bottleShake: {
    element: '.polish-bottle',
    keyframes: [
      { transform: 'rotate(-5deg)', offset: 0 },
      { transform: 'rotate(5deg)', offset: 0.25 },
      { transform: 'rotate(-5deg)', offset: 0.5 },
      { transform: 'rotate(5deg)', offset: 0.75 },
      { transform: 'rotate(0deg)', offset: 1 }
    ],
    options: {
      duration: 300,
      iterations: 3,
      easing: 'ease-in-out'
    }
  },
  
  // Stage 2: Brush stroke
  brushStroke: {
    element: '.brush',
    path: 'M10,50 Q50,10 90,50', // SVG path
    animation: {
      strokeDasharray: 200,
      strokeDashoffset: [200, 0],
      duration: 1500,
      easing: 'ease-out'
    },
    shimmer: {
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
      animation: 'shimmer 1s ease-out'
    }
  },
  
  // Stage 3: Color fill
  colorFill: {
    element: '.nail-shape',
    animation: {
      clipPath: [
        'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        'polygon(0 100%, 100% 100%, 100% 0, 0 0)'
      ],
      background: 'var(--selected-color)',
      duration: 2000,
      easing: 'ease-in-out'
    },
    bubbles: {
      count: 10,
      animation: 'bubble-up 1s ease-out forwards',
      stagger: 100
    }
  },
  
  // Stage 4: Top coat shine
  topCoat: {
    element: '.top-coat',
    animation: {
      opacity: [0, 0.8],
      background: 'linear-gradient(135deg, transparent, white, transparent)',
      transform: 'translateX(-100%) skewX(-25deg)',
      duration: 800,
      easing: 'ease-out'
    }
  },
  
  // Stage 5: Sparkle burst
  finalSparkle: {
    particles: {
      count: 20,
      spread: 360,
      velocity: { min: 5, max: 15 },
      decay: 0.95,
      animation: 'sparkle-burst 1s ease-out'
    }
  }
};
```

### Progress Bar Animation

```css
/* Segmented progress bar */
.progress-segment {
  width: 18%;
  height: 4px;
  background: #E0E0E0;
  transition: all 400ms var(--ease-out);
  position: relative;
  overflow: hidden;
}

.progress-segment.active {
  background: var(--rose-gold);
  animation: segment-fill 400ms ease-out forwards;
}

.progress-segment.active::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shimmer 1s ease-out;
}

@keyframes segment-fill {
  from {
    transform: scaleX(0);
    transform-origin: left;
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}
```

### Fun Facts Rotation

```javascript
const FunFactsAnimation = {
  transition: {
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 300, ease: "easeIn" }
    },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 400, delay: 100, ease: "easeOut" }
    }
  },
  
  // Typewriter effect for facts
  typewriter: {
    animation: "typing 2s steps(40, end)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    borderRight: "2px solid var(--rose-gold)"
  }
};
```

## 📊 Results Screen Animations

### Before/After Slider

```css
/* Slider handle */
.comparison-slider {
  position: relative;
  overflow: hidden;
}

.slider-handle {
  position: absolute;
  width: 40px;
  height: 40px;
  background: white;
  border: 3px solid var(--rose-gold);
  border-radius: 50%;
  cursor: grab;
  transition: transform 200ms var(--ease-out);
  z-index: 10;
}

.slider-handle:active {
  cursor: grabbing;
  transform: scale(1.2);
}

/* Slide transition */
.image-before,
.image-after {
  transition: clip-path 0ms; /* Instant for smooth dragging */
}

/* Reveal animation on load */
@keyframes reveal-comparison {
  from {
    clip-path: inset(0 50% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
```

### Share Button Celebration

```javascript
const ShareCelebration = {
  onClick: {
    confetti: {
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#E8B4B8', '#FFD700', '#FFF']
    },
    
    button: {
      animation: "share-success 600ms ease-out",
      haptic: "success"
    },
    
    icon: {
      transform: [
        { scale: 1, rotate: 0 },
        { scale: 1.3, rotate: 360 },
        { scale: 1, rotate: 360 }
      ],
      duration: 600
    }
  }
};
```

### Save Animation

```css
/* Heart favorite animation */
.favorite-button {
  position: relative;
}

.favorite-button.active .heart-icon {
  animation: heart-beat 600ms var(--ease-bounce);
  fill: #FF69B4;
}

@keyframes heart-beat {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  35% { transform: scale(1); }
  45% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* Particle burst */
.favorite-button.active::after {
  content: '❤️';
  position: absolute;
  animation: love-burst 800ms ease-out forwards;
}

@keyframes love-burst {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}
```

## 🎯 Micro-Interactions

### Button Interactions

```css
/* Universal button style */
.button {
  position: relative;
  overflow: hidden;
  transition: all 200ms var(--ease-out);
}

/* Ripple effect */
.button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 600ms, height 600ms;
}

.button:active::before {
  width: 300px;
  height: 300px;
}

/* Hover lift */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Press scale */
.button:active {
  transform: translateY(0) scale(0.98);
}
```

### Card Interactions

```css
/* Card hover effect */
.card {
  transition: all 300ms var(--ease-out);
  transform-style: preserve-3d;
}

.card:hover {
  transform: translateY(-4px) rotateX(2deg);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

/* Card entrance animation */
.card-enter {
  opacity: 0;
  transform: translateY(20px);
}

.card-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 400ms var(--ease-out);
  transition-delay: calc(var(--index) * 50ms);
}
```

### Navigation Transitions

```javascript
const PageTransitions = {
  // Slide navigation
  slideLeft: {
    exit: { x: '-100%', opacity: 0 },
    enter: { x: 0, opacity: 1 },
    transition: { duration: 300, ease: "easeOut" }
  },
  
  // Fade up
  fadeUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 400, ease: "easeOut" }
  },
  
  // Scale fade
  scaleFade: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 300, ease: "easeOut" }
  }
};
```

## 🎪 Special Effects

### Shimmer Effect

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

### Glow Effect

```css
.glow {
  box-shadow: 
    0 0 20px rgba(232, 180, 184, 0.5),
    0 0 40px rgba(232, 180, 184, 0.3),
    0 0 60px rgba(232, 180, 184, 0.1);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(232, 180, 184, 0.5),
      0 0 40px rgba(232, 180, 184, 0.3);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(232, 180, 184, 0.7),
      0 0 50px rgba(232, 180, 184, 0.5);
  }
}
```

### Particle System

```javascript
const ParticleEffects = {
  sparkles: {
    create: (x, y, count = 10) => {
      for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--angle', Math.random() * 360 + 'deg');
        particle.style.setProperty('--distance', Math.random() * 100 + 50 + 'px');
        document.body.appendChild(particle);
        
        particle.addEventListener('animationend', () => particle.remove());
      }
    }
  }
};
```

## 📱 Haptic Feedback

```javascript
const HapticFeedback = {
  // Light tap
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Success
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },
  
  // Error
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },
  
  // Warning
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30]);
    }
  }
};
```

## 🎭 Performance Guidelines

### Animation Performance

```javascript
// Use transform and opacity only for animations
const performantAnimations = {
  good: ['transform', 'opacity', 'filter'],
  avoid: ['width', 'height', 'top', 'left', 'margin', 'padding']
};

// RequestAnimationFrame for smooth animations
const smoothAnimation = (callback) => {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Will-change for heavy animations
const prepareAnimation = (element) => {
  element.style.willChange = 'transform';
  
  // Clean up after animation
  element.addEventListener('transitionend', () => {
    element.style.willChange = 'auto';
  }, { once: true });
};
```

### Optimization Tips

1. **Use CSS animations** over JavaScript when possible
2. **Batch DOM updates** to avoid layout thrashing
3. **Use `transform3d`** to enable hardware acceleration
4. **Implement `will-change`** for predictable animations
5. **Remove animations** on low-power mode
6. **Use `Intersection Observer`** for scroll animations
7. **Debounce/throttle** rapid user interactions

## 🌟 Signature Animations

### App Signature Animation
```css
/* The "Nail Polish Drip" - App's signature loading animation */
@keyframes nail-polish-drip {
  0% {
    clip-path: ellipse(0% 0% at 50% 0%);
    transform: translateY(-100%);
  }
  50% {
    clip-path: ellipse(150% 100% at 50% 0%);
    transform: translateY(0);
  }
  75% {
    clip-path: ellipse(100% 100% at 50% 0%);
    transform: translateY(5%);
  }
  100% {
    clip-path: ellipse(100% 100% at 50% 0%);
    transform: translateY(0);
  }
}
```

This comprehensive animation guide ensures every interaction in the app feels premium, smooth, and delightful, creating an experience that users will love to use and share.