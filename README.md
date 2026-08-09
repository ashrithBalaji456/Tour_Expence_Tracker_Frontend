<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0EA5E9,100:8B5CF6&height=200&section=header&text=Tour%20Expense%20Tracker&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Frontend%20%E2%80%94%20React%20%2B%20Vite%20%2B%20TailwindCSS&descAlignY=55&descSize=16" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=800&color=8B5CF6&center=true&vCenter=true&width=600&lines=Glassmorphic+Dark+Dashboard+UI;Framer+Motion+Micro-Animations;Real-Time+Trip+Analytics" />

[![React Version](https://img.shields.io/badge/React-18-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-FF00C1.svg?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-0EA5E9?style=for-the-badge)](https://tour-expence-tracker-frontend.vercel.app/)
[![Backend Repo](https://img.shields.io/badge/Backend_Repo-GitHub-181717?style=for-the-badge&logo=github)](https://github.com/ashrithBalaji456/Tour_Expence_Tracker_Backend)

</div>

---

## 📱 About

This repository contains the client-side single page application (SPA) for the **Tour Expense Tracker**. It delivers a high-fidelity glassmorphic dark interface to manage trip planning, log daily purchases in real time, and execute peer-to-peer balance settlements.

🔗 **Live Application:** [tour-expence-tracker-frontend.vercel.app](https://tour-expence-tracker-frontend.vercel.app/)
🔗 **Backend Repo:** [Tour_Expence_Tracker_Backend](https://github.com/ashrithBalaji456/Tour_Expence_Tracker_Backend)

---

## 🎨 Premium UI & Interactive Features

- **Glassmorphic Dark Theme** — translucent frosted panels, glowing hover feedback, curated color palette
- **Framer Motion micro-animations** — fluid transitions across login, dashboard, modals, and filter toggles
- **Unified Analytics** — Recharts donut chart for category spend + a daily outflow timeline bar chart that auto-excludes internal cash settlements
- **Custom Form Controls** — click-outside-aware React dropdowns replacing native date pickers, category selects, and sort menus
- **Group Management** — create trip groups, invite members, switch between active trips, admin-only deletion

---

## 🧩 Component Architecture

```mermaid
graph TD
    App[App.jsx] --> AuthScreens[AuthScreens.jsx]
    App --> MainDashboard[Main Dashboard View]

    MainDashboard --> Header[Header / Group Selector / Sign Out]
    MainDashboard --> QuickActions[Quick 1-Tap Purchase Buttons]
    MainDashboard --> SummaryCards[Summary Cards: Spent, Budget, Remaining]
    MainDashboard --> SplitSettlements[Trip Settlements / Budget Status]
    MainDashboard --> AnalyticsCharts[Analytics: Pie & Bar Graphs]
    MainDashboard --> CalculatorWidget[Calculator Widget]
    MainDashboard --> ExpenseList[Daily Purchases List]
    MainDashboard --> PreTripPlanner[Pre-Trip Planner / Bookings View]

    ExpenseList --> CustomDatePicker[CustomDatePicker.jsx]
    ExpenseList --> CategoryDropdown[Custom Category Menu]
    ExpenseList --> SortDropdown[Custom Sort Menu]

    style App fill:#0F172A,stroke:#0EA5E9,stroke-width:2px,color:#fff
    style AuthScreens fill:#0F172A,stroke:#8B5CF6,stroke-width:1px,color:#fff
    style MainDashboard fill:#0F172A,stroke:#10B981,stroke-width:1px,color:#fff
    style PreTripPlanner fill:#0F172A,stroke:#EAB308,stroke-width:1px,color:#fff
```

---

## 📊 Client-Side State & Session Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    User->>AuthScreens: Input credentials / Login
    AuthScreens->>Backend: POST /api/auth/login
    Backend-->>AuthScreens: Return JWT Token & group list
    AuthScreens->>LocalStorage: Store 'token' & 'username'
    AuthScreens->>AuthScreens: If multiple groups, render Selector
    User->>AuthScreens: Select Active Trip Group
    AuthScreens->>LocalStorage: Store 'activeGroupId'
    AuthScreens->>App: Trigger onAuthSuccess()
    App->>Backend: GET /api/dashboard/summary (with X-Trip-Group-Id header)
    Backend-->>App: Populate Dashboard charts, items, & balances
```

---

## 🖼️ User Journey

```mermaid
flowchart LR
    A([Login / Register]) --> B[Select or Create Trip Group]
    B --> C[View Dashboard: Budget, Spend, Remaining]
    C --> D[Log Purchase via 1-Tap or Full Form]
    D --> E[Charts Auto-Update: Category & Timeline]
    E --> F[Check Settlements: Who Owes Whom]
    F --> G[Tap 'Settle' to Clear a Debt]
    G --> C

    style A fill:#0F172A,stroke:#0EA5E9,color:#fff
    style D fill:#0F172A,stroke:#8B5CF6,color:#fff
    style F fill:#0F172A,stroke:#F43F5E,color:#fff
    style G fill:#0F172A,stroke:#10B981,color:#fff
```

---

## 🛠️ Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Step 1: Clone Repository
```bash
git clone https://github.com/ashrithBalaji456/Tour_Expence_Tracker_Frontend.git
cd Tour_Expence_Tracker_Frontend
```

### Step 2: Install Project Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root folder:
```env
VITE_API_URL=http://localhost:8080/api
```

### Step 4: Launch Developer Server
```bash
npm run dev
```
Open `http://localhost:3001` in your browser to inspect the application.

---

## ⚡ Deployment to Vercel (Production)

The project is fully pre-configured for automated production pipelines on Vercel:

1. Connect your GitHub repository to Vercel.
2. Set the **Build Command** to: `npm run build`
3. Set the **Output Directory** to: `dist`
4. Configure the environment variable `VITE_API_URL` to point to your live deployed backend URL (e.g. `https://tour-expence-tracker-backend.onrender.com/api`).
5. Click **Deploy**!

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:8B5CF6,100:0EA5E9&height=100&section=footer" />

</div>
