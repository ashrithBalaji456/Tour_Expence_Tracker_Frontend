# Android Troubleshooting & Common Issues Guide

This document lists solutions to common issues when developing and running the **Tour Expense Tracker** Android hybrid application.

---

## 1. Java Version Mismatch: `invalid source release: 21`

### Symptom:
```
Execution failed for task ':capacitor-android:compileDebugJavaWithJavac'.
> Java compilation initialization error
    error: invalid source release: 21
```

### Cause:
Capacitor 7/8 compiles Android plugins with Java 21 compatibility (`sourceCompatibility = JavaVersion.VERSION_21`). If your terminal `JAVA_HOME` points to Java 17, `javac` cannot target release 21.

### Solution:
Point `JAVA_HOME` to JDK 21+ or JDK 22 (already installed at `C:\Program Files\Java\jdk-22`) or Android Studio's JBR:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
cd Frontend\android
.\gradlew.bat assembleDebug
```

---

## 2. Android Network Error: `ERR_CONNECTION_REFUSED` to `localhost:8080`

### Symptom:
When running on an Android device or emulator, API calls fail with `ERR_CONNECTION_REFUSED` pointing to `http://localhost:8080/api`.

### Cause:
On an Android phone or emulator, `localhost` refers to the mobile device itself, NOT your development computer or remote server. Furthermore, the Capacitor WebView origin is `https://localhost`.

### Solution:
The project's `Frontend/src/api/expenseApi.js` automatically detects native Capacitor execution via `isNative()`. When running on Android, it always routes to the production Render backend:
```
https://tour-expence-tracker-backend.onrender.com/api
```
If you ever want an emulator to connect to your local computer's Spring Boot backend during local dev, run `adb reverse tcp:8080 tcp:8080` or pass:
```env
VITE_API_URL=http://10.0.2.2:8080/api
```

---

## 3. Backend CORS Preflight Blocked (`CORS Missing Allow Origin`)

### Symptom:
Axios requests from Android WebView fail with preflight CORS errors.

### Cause:
Android Capacitor sends requests with `Origin: https://localhost` or `Origin: capacitor://localhost`.

### Solution:
In `Backend/src/main/java/com/tripexpense/tracker/config/CorsConfig.java`, the following origins are explicitly allowed:
```java
config.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",
    "https://localhost",
    "http://localhost",
    "capacitor://localhost",
    "https://*.onrender.com",
    "https://*.netlify.app",
    "https://*.vercel.app",
    "https://tour-expence-tracker-frontend.vercel.app"
));
```

---

## 4. Render Backend Cold-Start Delays

### Symptom:
Initial requests after 15 minutes of inactivity take 30-50 seconds.

### Solution:
- Axios timeout is configured to `30000ms` (30 seconds) in `Frontend/src/api/expenseApi.js`.
- The top `<NetworkBanner />` component alerts users if connectivity drops and allows instant one-tap retry without data loss.

---

## 5. White Screen or Web Assets Not Updating

### Symptom:
Frontend changes are not reflected in the Android APK.

### Solution:
Remember that Capacitor bundles the compiled React application from the `dist` directory. Whenever code changes are made:
```powershell
cd Frontend
npm run build
npx cap sync android
```
Then re-run or re-assemble the debug APK.

---

## 6. Android Hardware Back Button Exits the App

### Symptom:
Pressing the physical back button closes the application instead of dismissing an open modal or returning to the dashboard.

### Solution:
The app uses `nativeService.registerBackHandler(...)` in `App.jsx`. The hierarchy is:
1. Debt settlement modal (`settlingTransfer`) -> closes modal.
2. Fund history modal (`isFundHistoryOpen`) -> closes modal.
3. Add fund modal (`isFundModalOpen`) -> closes modal.
4. Expense modal (`isExpenseModalOpen`) -> closes modal.
5. Pre-Trip Planner view (`currentView === 'pretrip'`) -> navigates back to Dashboard.
6. Root Dashboard -> minimizes app cleanly without force-killing.

