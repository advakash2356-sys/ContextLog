# ContextLog

ContextLog is a task management and focus session application with insights tracking.

## Features

- **Task Management**: Create, view, filter, sort, and complete tasks with support for categories, priorities, due dates, and subtasks.
- **Focus Timer**: Configurable focus and break sessions with ambient sounds (`rain`, `forest`, `cafe`), mute controls, auto-start breaks, and task association.
- **Goal Tracking & Celebrations**: Track completed focus sessions against daily goals, complete with visual celebration animations.
- **Insights & Analytics**: Review completion rates, pending tasks, overdue metrics, goal progress, and session histories.
- **Data Backup & Restore**: Export, import, and copy task and session history data.
- **Shortcuts & Dark Mode**: Keyboard shortcut modal support and light/dark theme toggles.
- **Multi-Platform Source**: Includes both a web frontend (React/TypeScript) and Android application components (Kotlin/Jetpack Compose).

## Tech Stack

### Web Application
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

### Android Application
- **Language**: Kotlin
- **Architecture/UI**: Jetpack Compose, ViewModel
- **Testing**: Robolectric

## Setup

### Web Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview the production build:
   ```bash
   npm run preview
   ```

### Android Application

*Note: Android build files (such as root `build.gradle` or Gradle wrapper scripts) are not present in the visible repository files. Android setup and build instructions are not configured.*

## Usage

- **Run Dev Server**: Run `npm run dev` to serve the web interface locally at `http://0.0.0.0:3000`.
- **Navigation**: Switch between tasks, the focus timer, and insights views using the navigation bar.
- **Timer**: Select durations, toggle ambient sounds, and link sessions to active tasks.
- **Data Management**: Clear session histories or import/export data backups from the insights panel.

## Project Structure

```text
ContextLog/
├── app/                              # Android application source
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── model/Task.kt
│   │   │   │   ├── ui/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── FocusTimerComponents.kt
│   │   │   │   │   │   ├── InsightsComponents.kt
│   │   │   │   │   │   └── TaskComponents.kt
│   │   │   │   │   └── theme/
│   │   │   │   │       ├── Color.kt
│   │   │   │   │       ├── Theme.kt
│   │   │   │   │       └── Type.kt
│   │   │   │   └── viewmodel/MainViewModel.kt
│   │   │   └── res/values/strings.xml
│   │   └── test/java/com/example/ExampleRobolectricTest.kt
├── public/                           # Web static assets and manifest
│   ├── favicon.svg
│   └── manifest.json
├── src/                              # React frontend application
│   ├── components/
│   │   ├── FocusTimer.tsx
│   │   ├── GoalCelebration.tsx
│   │   ├── InsightsView.tsx
│   │   ├── Navbar.tsx
│   │   ├── ShortcutsModal.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskModal.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── audio.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── metadata.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
