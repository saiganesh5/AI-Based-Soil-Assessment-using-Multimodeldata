# About Page — Professional Documentation & Team Profiles

## Summary

Completely rebuilt the `/about` page into a comprehensive, interactive documentation hub with team profiles. The page matches the existing emerald/dark-mode UI theme and provides in-depth explanations of every platform module.

## What Changed

### [MODIFY] [About.tsx](file:///c:/Users/Asus/OneDrive/Documents/GitHub/AI-Based-Soil-Assessment-using-Multimodeldata/src/pages/About.tsx)

Complete rewrite from ~120 lines to ~440 lines. The new page includes:

#### 1. Hero Header
- Animated gradient banner with floating orbs
- "Documentation & Team" badge pill

#### 2. Mission Section
- Two-column layout: mission text + stat cards
- Stats: 12 soil types, 38+ disease categories, 18 dashboard widgets, 24/7 AI chatbot

#### 3. Interactive Documentation (Tabbed)
Three switchable tabs with smooth transitions:

| Tab | Content |
|-----|---------|
| **📦 Modules** | 7 collapsible accordions covering every platform module |
| **🏗️ Architecture** | 6-step data flow + 3-tier system diagram (Frontend → Backend → Services) |
| **⚡ Tech Stack** | 5 category cards (Frontend, Backend, AI/ML, Services, DevOps) |

**Module Accordions:**
1. **Soil Analysis Dashboard** (Core Module) — Image upload, location selection, soil parameters, gauge chart, crop/fertilizer/yield/profit cards
2. **Soil Intelligence Engine** — Health score, state-soil mapping, seasonal planner, crop rotation, irrigation, disease risk, government schemes
3. **Weather Intelligence** — Location search, interactive map, dashboard, agricultural advisory
4. **Crop Disease Prediction** — Upload flow, EfficientNetV2 model, top-5 predictions, supported crops
5. **SoilBot AI Chatbot** — Gemini API, multilingual support, conversation history, FAB widget
6. **Authentication & Profile** — Firebase Auth flows (register, login, reset)
7. **Interactive Guided Tour** — TourContext system, per-page spotlights, replay functionality

#### 4. Team Section
Three professional profile cards for:
- **Sai Ganesh** — Full-Stack Developer & ML Engineer
- **Sai Chandu** — Frontend Developer & UI/UX Designer  
- **Mani Karthik** — ML Engineer & Backend Developer

Each card includes:
- Real photograph (from project root, copied to `/public/team/`)
- Role title
- Short bio
- Contribution tags
- GitHub profile link with icon

#### 5. Project Stats
Glass card with: 6+ Months, 1000+ Samples, 95% Accuracy

#### 6. CTA Section
Gradient banner with "Start Analysis" and "Contact Us" buttons

### [NEW] `/public/team/` directory
Copied team images from project root:
- `ganesh.jpg` → `/public/team/ganesh.jpg`
- `Sai chandu.jpg` → `/public/team/saichandu.jpg`
- `Mani karthik.jpg` → `/public/team/manikarthik.jpg`

## Custom Components Built

| Component | Purpose |
|-----------|---------|
| `Accordion` | Reusable collapsible section with icon, title, badge, expand/collapse animation |
| `Pill` | Inline highlighted tech label (emerald background) |

## Verification

- ✅ Vite dev server compiled successfully with zero errors
- ✅ Page renders at `http://localhost:5173/about`
- ✅ All 3 tabs (Modules, Architecture, Tech Stack) switch correctly
- ✅ All 7 accordion sections expand/collapse with smooth animations
- ✅ Team images load from `/public/team/`
- ✅ Dark mode styling is fully consistent
- ✅ Responsive layout works on all screen sizes
- ✅ GitHub profile links open in new tabs
