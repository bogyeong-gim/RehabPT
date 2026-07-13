# 새늘 (RehabPT)

A cross-platform rehabilitation companion app that connects **patients**, **physical therapists**, and **administrators**. Therapists assign exercise schedules and review patient feedback; patients follow along with guided exercise videos and log how each session felt; both sides stay in touch through built-in 1:1 chat.

Built with **Expo / React Native** and **Firebase**.

---

## Features

### 🧑‍🦽 Patient
- **Home** – overview of today's assigned exercises and schedule status
- **Schedule** – calendar of assigned rehab sessions (`pending` / `completed` / `missed`)
- **Exercise videos** – browse and play guided exercise videos by category
- **Feedback** – log pain level (1–10), perceived difficulty (1–5), a memo, and which exercises were completed
- **Chat** – message your assigned therapist directly

### 🧑‍⚕️ Therapist
- **Home** – dashboard of assigned patients and their progress
- **Patient list** – manage the patients under your care
- **Schedule management** – create and assign exercise schedules (with sets/reps/duration)
- **Feedback review** – read patient feedback and add comments
- **Video management** – upload/manage exercise videos
- **Chat** – message patients

### 🛠️ Admin
- **Dashboard** – system-wide overview
- **User management** – manage patient / therapist / admin accounts

---

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | [Expo](https://docs.expo.dev/) `~57.0` · React Native `0.86` · React `19.2` |
| Language | TypeScript |
| Backend | Firebase — Auth, Firestore, Storage |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Navigation | React Navigation (native-stack + bottom-tabs) |
| UI | React Native Paper, @react-native-vector-icons/material-design-icons |
| Chat | react-native-gifted-chat |
| Calendar | react-native-calendars |
| Video | expo-av |

---

## Project Structure

```
RehabPT/
├── App.tsx                  # Root component (PaperProvider + navigation)
├── index.ts                 # Expo entry point
├── firebaseConfig.ts        # Firebase initialization (auth, db, storage)
├── app.json                 # Expo app config
├── scripts/
│   ├── seedData.ts          # Seed sample data into Firestore
│   └── seedTestAccounts.ts  # Create test accounts for each role
└── src/
    ├── types/               # Shared TypeScript models (User, Schedule, Feedback, …)
    ├── navigation/          # Role-based navigators (Auth/Patient/Therapist/Admin)
    ├── screens/             # Screens grouped by role & feature
    │   ├── auth/            # Login, Register
    │   ├── patient/         # Home, Schedule, Videos, Feedback
    │   ├── therapist/       # Home, Patients, Schedule, Feedback, Videos
    │   ├── admin/           # Dashboard, User management
    │   ├── chat/            # Chat list & room
    │   └── video/           # Video player
    ├── services/            # Firebase data access (auth, schedule, feedback, chat, video)
    ├── store/               # Zustand stores (auth, schedule, chat)
    ├── components/          # Shared UI components
    └── utils/               # Constants (colors, categories, pain/difficulty scales) & helpers
```

Navigation is **role-driven**: after login, `AppNavigator` reads the authenticated user's `role` and renders the matching navigator (patient / therapist / admin), falling back to the auth flow when signed out.

---

## Getting Started

### Prerequisites
- Node.js (LTS) and npm
- The [Expo Go](https://expo.dev/go) app on your device, or an iOS Simulator / Android emulator
- A [Firebase](https://console.firebase.google.com/) project

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase
Update `firebaseConfig.ts` with your own Firebase project's settings (from the Firebase console → Project settings). In the console, enable:
- **Authentication** → Email/Password sign-in
- **Cloud Firestore**
- **Storage**

> ⚠️ The committed `firebaseConfig.ts` contains placeholder/example credentials. Replace them with your own before running, and avoid committing real secrets.

### 3. Run the app
```bash
npm start        # start the Expo dev server
npm run android  # open on Android
npm run ios      # open on iOS
npm run web      # open in the browser
```

---

## Seeding Test Data

Helper scripts under `scripts/` create test accounts and sample data in Firestore.

`seedTestAccounts.ts` creates one account per role:

| Role | Email | Password |
|------|-------|----------|
| Patient | `patient@test.com` | `test1234` |
| Therapist | `therapist@test.com` | `test1234` |
| Admin | `admin@test.com` | `test1234` |

Run them with a TypeScript runner (e.g. `npx tsx scripts/seedTestAccounts.ts`) after configuring Firebase.

---

## Data Model

Core Firestore collections (see `src/types/index.ts`):

- **User** – `role` (`patient` | `therapist` | `admin`), profile, and relationships (`therapistId`, `patients`)
- **Schedule** – an assigned rehab session with a list of `Exercise` items and a `status`
- **Feedback** – patient's post-session report (pain, difficulty, memo, completed exercises, therapist comment)
- **ChatRoom** / **Message** – 1:1 messaging between users
- **Video** – exercise videos with category and metadata

---

## License

[MIT](./LICENSE)
