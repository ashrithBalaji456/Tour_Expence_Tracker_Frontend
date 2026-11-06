# Environment Variables & Configuration Reference

This guide details all environment variables used across the frontend, native Android wrapper, and backend services.

---

## 1. Frontend Environment Variables (`Frontend/.env` or Vercel)

The frontend works zero-config out of the box because `expenseApi.js` intelligently selects the right URL based on environment detection. However, you can override any setting using standard Vite environment variables:

| Variable | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `https://tour-expence-tracker-backend.onrender.com/api` (prod) or `http://localhost:8080/api` (dev) | The base URL for all REST API endpoints. |

### How `getBaseUrl()` resolves:
1. If `VITE_API_URL` is set -> uses `VITE_API_URL`.
2. If running inside native Capacitor (Android/iOS) -> uses `https://tour-expence-tracker-backend.onrender.com/api`.
3. If running in a web browser on `localhost` or `127.0.0.1` -> uses `http://localhost:8080/api`.
4. Production web fallback -> uses `https://tour-expence-tracker-backend.onrender.com/api`.

---

## 2. Backend Environment Variables (`Backend/src/main/resources/application.properties` or Render)

These variables are configured on Render or in your local environment when running the Spring Boot backend:

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | Port on which the Spring Boot server listens. | `8080` |
| `SPRING_DATASOURCE_URL` | Yes | JDBC URL to the PostgreSQL database. | `jdbc:postgresql://<host>:<port>/<db>?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Yes | Database username. | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Yes | Database password (keep secret). | `••••••••` |

---

## 3. Native Android Environment Variables (Local Machine)

For local Gradle builds and command-line execution:

| Variable | Required | Path Example | Description |
|---|---|---|---|
| `JAVA_HOME` | Yes (for CLI builds) | `C:\Program Files\Java\jdk-22` | JDK 21+ required by Capacitor 7/8 for compiling native plugins. |
| `ANDROID_HOME` | Yes (for CLI builds) | `C:\Users\<user>\AppData\Local\Android\Sdk` | Path to Android SDK. |
| `PATH` | Yes | Includes `%ANDROID_HOME%\platform-tools` | Enables `adb` commands from any terminal prompt. |

---

## 4. Security & Sensitive Information Checklist

- **No Passwords or Secrets in LocalStorage**: User passwords are never saved. Only JWT authorization tokens and active group identifiers are persisted.
- **Android Sandboxing**: On Android devices, `@capacitor/preferences` stores sensitive data inside the application's private sandbox directory, inaccessible to other apps.
- **CORS Restricted**: Backend CORS permits only trusted website domains and the native `https://localhost` Capacitor scheme. Wildcard `*` with credentials is strictly avoided.
- **Signing Credentials**: Release keystores (`.jks`) must never be committed to Git.

