# 🤖 CLAUDE.md - AI Development Guidelines & Instructions

## Overview

This document provides instructions for Claude AI to systematically build the Nail App using Next.js 14+ with mobile-only responsive design. All development must follow the chronological implementation plan, require explicit approval for changes, and maintain comprehensive documentation.

## 🏗️ Technical Architecture

### ⚠️ CRITICAL: Gemini Model Version
**ALWAYS use Gemini 2.5 Flash (gemini-2.5-flash-image-preview) for image generation/transformation**
- NOT Gemini 2.0
- NOT Gemini 1.5
- Model name: `gemini-2.5-flash-image-preview` for image generation
- Model name: `gemini-2.5-flash` for text/analysis

### Core Technology Stack

```yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript (strict mode)
Styling: Tailwind CSS + CSS Modules for animations
State Management: Zustand + React Query
Database: Supabase (PostgreSQL)
Storage: Supabase Storage
AI Service: Google Gemini 2.5 Flash Image API (STRICTLY use gemini-2.5-flash model for image generation)
Deployment: Vercel Edge Functions
Analytics: Vercel Analytics + Mixpanel
Error Tracking: Sentry
```

### Mobile-Only Requirements

```javascript
// All components must be mobile-first
const mobileConstraints = {
  viewport: {
    minWidth: 320,
    maxWidth: 428, // iPhone 14 Pro Max
    targetWidth: 390 // iPhone 14 Pro
  },
  touch: {
    minTargetSize: 44, // iOS minimum
    spacing: 8 // Between interactive elements
  },
  performance: {
    fps: 60,
    tti: "<2s", // Time to interactive
    lcp: "<2.5s", // Largest contentful paint
    cls: "<0.1" // Cumulative layout shift
  }
};
```

## 📋 Development Workflow

### 1. Approval Requirements

**EVERY change requires explicit approval:**

```markdown
Before implementing ANY feature:
1. Present the planned implementation approach
2. Show code structure and file organization
3. Explain security considerations
4. Wait for explicit "approved" or "proceed" confirmation
5. Only then begin implementation
```

### 2. Documentation Standards

**All code must include:**

```typescript
/**
 * Component: [Name]
 * Purpose: [Clear description]
 * Author: Claude AI
 * Date: [Creation date]
 * Dependencies: [List external dependencies]
 * Security: [Note any security considerations]
 * Mobile: [Specific mobile optimizations]
 */
```

### 3. Implementation Order

**MUST follow chronological order from master-implementation-plan.md:**

```
Phase 1: Foundation (Days 1-5)
  ✓ Get approval for each day's tasks
  ✓ Complete Day 1 before starting Day 2
  ✓ Document completion of each phase

Phase 2: User Experience (Days 6-10)
  ✓ Only begin after Phase 1 approval
  ✓ Test on mobile devices after each feature

Phase 3: Enhanced Features (Days 11-15)
  ✓ Requires Phase 2 completion confirmation

Phase 4: Polish & Optimization (Days 16-20)
  ✓ Final review and deployment preparation
```

## 🔒 Security Requirements

### Critical Security Checklist

```typescript
const securityRequirements = {
  api: {
    geminiKey: "MUST use environment variables",
    supabaseKeys: "Never expose anon key in client code",
    rateLimit: "Implement per-user API call limits",
    validation: "Validate all user inputs server-side"
  },
  
  images: {
    maxSize: "5MB per image",
    formats: "['image/jpeg', 'image/png', 'image/webp']",
    sanitization: "Strip EXIF data before storage",
    storage: "Use signed URLs with expiration"
  },
  
  auth: {
    sessions: "Use secure httpOnly cookies",
    tokens: "Implement refresh token rotation",
    mfa: "Optional but recommended for premium users"
  },
  
  data: {
    encryption: "Encrypt sensitive data at rest",
    pii: "Minimize personal data collection",
    gdpr: "Implement data deletion on request",
    logs: "Never log sensitive information"
  }
};
```

### Security Implementation Pattern

```typescript
// Example: Secure API Route
// app/api/gemini/route.ts

import { rateLimit } from '@/lib/rate-limit';
import { validateImage } from '@/lib/validation';
import { sanitizeInput } from '@/lib/security';

export async function POST(req: Request) {
  // 1. Rate limiting
  const identifier = await getIdentifier(req);
  const { success } = await rateLimit(identifier);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // 2. Input validation
  const body = await req.json();
  const validation = await validateImage(body.image);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  
  // 3. Sanitization
  const sanitizedPrompt = sanitizeInput(body.prompt);
  
  // 4. API call with error handling
  try {
    const result = await callGeminiAPI(sanitizedInput);
    return NextResponse.json(result);
  } catch (error) {
    // Never expose internal errors
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

## 🎭 Subagent Deployment Strategy

### When to Deploy Subagents

```yaml
project-orchestrator:
  - Initial project setup
  - Dependency management
  - Build configuration

refactoring-architect:
  - After each phase completion
  - Code organization review
  - Performance optimization

security-audit-specialist:
  - Before API integration
  - After auth implementation
  - Pre-deployment review

qa-test-engineer:
  - After each feature completion
  - End-to-end testing
  - Mobile device testing

supabase-architect:
  - Database schema design
  - RLS policies setup
  - Storage configuration
```

## 📁 File Structure Convention

### Strict File Organization (Mobile Only)

```
nail-app-mobile/
├── App.tsx
├── app.json
├── components/
│   ├── camera/
│   ├── design/
│   └── ui/
├── screens/
│   ├── CameraScreen.tsx
│   ├── DesignScreen.tsx
│   ├── GalleryScreen.tsx
│   └── SettingsScreen.tsx
├── lib/
│   ├── api/
│   ├── stores/
│   └── utils/
├── navigation/
├── supabase/
│   ├── 00_RUN_ORDER.md
│   └── … SQL migrations …
├── theme/
└── src/
    ├── hooks/
    ├── services/
    └── types/
```

## 🧪 Testing Requirements

### Mobile Testing Checklist

```typescript
const testingRequirements = {
  unit: {
    coverage: ">80%",
    tools: ["Jest", "React Testing Library"],
    run: "Before each commit"
  },
  
  integration: {
    apis: "Mock all external services",
    database: "Use test database",
    auth: "Test all auth flows"
  },
  
  e2e: {
    devices: [
      "iPhone 14 Pro",
      "iPhone SE",
      "Samsung Galaxy S23",
      "Pixel 7"
    ],
    tools: ["Playwright", "Cypress"],
    scenarios: [
      "Complete onboarding flow",
      "Capture and transform image",
      "Share with nail tech",
      "Save to favorites"
    ]
  },
  
  performance: {
    lighthouse: ">90 score",
    bundleSize: "<500KB initial",
    imageOptimization: "WebP with fallback"
  }
};
```

## 🚀 Deployment Checklist

### Pre-Deployment Requirements

```markdown
□ Security audit completed
□ All tests passing
□ Environment variables configured
□ API rate limits implemented
□ Error tracking configured
□ Analytics implemented
□ GDPR compliance verified
□ Performance benchmarks met
□ Mobile testing on 5+ devices
□ Accessibility audit passed
□ SEO meta tags configured
□ PWA manifest configured
□ Backup strategy implemented
□ Rollback plan documented
□ Monitoring alerts configured
```

## 📝 Code Review Standards

### Every PR Must Include

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Security enhancement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Mobile devices tested

## Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Rate limiting considered
- [ ] Error handling complete

## Documentation
- [ ] Code comments added
- [ ] README updated if needed
- [ ] API docs updated

## Screenshots
[Mobile screenshots required]
```

## 🔄 Development Commands

### Standard Commands to Run

```bash
# Before starting development
npm run lint
npm run type-check
npm run test

# During development
npm run dev:mobile  # Runs with mobile viewport

# Before committing
npm run format
npm run test:coverage
npm run build

# Security checks
npm audit
npm run security:check

# Performance
npm run analyze
npm run lighthouse
```

## 🎯 Success Criteria

### Definition of Done

```yaml
Feature Complete When:
  - Approved by user
  - Code documented
  - Tests written and passing
  - Mobile responsive verified
  - Security reviewed
  - Performance benchmarks met
  - Error handling implemented
  - Loading states added
  - Accessibility compliant
  - Analytics events tracked
```

## 🚨 Critical Rules

### NEVER DO

```markdown
1. NEVER expose API keys in code
2. NEVER skip user approval
3. NEVER implement features out of order
4. NEVER ignore mobile constraints
5. NEVER store sensitive data in localStorage
6. NEVER skip error handling
7. NEVER use any/unknown TypeScript types
8. NEVER commit without testing
9. NEVER use desktop-first design
10. NEVER exceed mobile viewport width
```

### ALWAYS DO

```markdown
1. ALWAYS request approval before changes
2. ALWAYS follow the implementation plan order
3. ALWAYS document security considerations
4. ALWAYS test on mobile viewport
5. ALWAYS use TypeScript strict mode
6. ALWAYS implement loading states
7. ALWAYS handle errors gracefully
8. ALWAYS optimize for performance
9. ALWAYS use semantic HTML
10. ALWAYS follow accessibility guidelines
```

## 📊 Progress Tracking

### Daily Standup Format

```markdown
## Date: [Current Date]

### Completed Yesterday
- [List completed tasks]

### Planned Today
- [List planned tasks - require approval]

### Blockers
- [List any blockers]

### Security Concerns
- [Note any security considerations]

### Questions for User
- [List questions requiring clarification]
```

## 🔧 Configuration Files

### Required Configuration

```typescript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['supabase.co'],
    formats: ['image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}

// .env.local (template)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
SENTRY_DSN=
MIXPANEL_TOKEN=
```

## 📋 Implementation Checkpoints

### Phase Checkpoints

```markdown
Before proceeding to next phase, confirm:

□ All previous phase tasks completed
□ User has reviewed and approved
□ Tests are passing
□ Documentation is updated
□ Security review completed
□ Performance metrics met
□ Mobile testing completed
□ No critical bugs remaining
```

---

**Remember**: This is a mobile-only application. Every decision, every component, and every interaction must be optimized for mobile devices. Desktop experience is not a consideration.
