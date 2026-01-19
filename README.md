# Shigure Cafe Frontend Application

A modernized, high-performance user management interface for ShigureCafe, designed with a focus on aesthetics, security, and a premium user experience. Built with Vue 3, Vite, and Tailwind CSS 4.

## Core Features

*   **Premium UI/UX Design:**
    *   **Glassmorphism & Modern Aesthetics:** Elegant use of backdrop blurs, gradients, and refined shadows for a high-end feel.
    *   **Tailwind CSS 4.0:** Utilizing the latest utility-first styling capabilities for a lean and responsive interface.
    *   **Micro-interactions:** Smooth transitions and interactive elements powered by modern CSS and Vue's transition system.
*   **Real-time Game Chat Relay:**
    *   **Live Synchronization:** Real-time bidirectional message relay between the web interface and the Minecraft server.
    *   **Interactive UI:** Modern chat interface with sender grouping, system messages, and presence indicators.
*   **Comprehensive Security Suite:**
    *   **Two-Factor Authentication (2FA):** Support for both Email-based 2FA and TOTP (Google Authenticator, etc.).
    *   **Microsoft OAuth2 Integration:** Securely bind Minecraft accounts using official Microsoft authentication.
    *   **Advanced Route Protection:** Granular access control with `GuestOnly`, `RequiresAuth`, and `RequiresAdmin` guards.
*   **Interactive Notice Board:**
    *   **Rich Content Rendering:** Full Markdown support with integrated **KaTeX** for high-quality mathematical expressions.
    *   **Engagement System:** Interactive emoji reactions and read-tracking.
    *   **Notice Management:** Admin tools for pinning, editing, and scheduling system-wide announcements.
*   **Administrative Dashboard:**
    *   **User Management:** Advanced tools for real-time search, role assignment, and account status control.
    *   **Audit Center:** Dedicated workflow for tracking and approving user registration requests.
*   **Multi-language Support (i18n):**
    *   Full internationalization support with built-in translations for **English (US)** and **Chinese (Simplified)**.

## Technical Stack

*   **Framework:** [Vue 3.5](https://vuejs.org/) (Composition API)
*   **Build Tool:** [Vite 7.2](https://vitejs.dev/)
*   **Language:** [TypeScript 5.9](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS 4.1](https://tailwindcss.com/)
*   **State Management:** [Pinia 3.0](https://pinia.vuejs.org/)
*   **Routing:** [Vue Router 4.6](https://router.vuejs.org/)
*   **Internationalization:** [Vue I18n 11.2](https://vue-i18n.intlify.dev/)
*   **Content Processing:**
    *   **Marked:** Fast Markdown parser.
    *   **Marked-KaTeX:** Extension for TeX/LaTeX math rendering.
*   **Icons:** [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next)
*   **QR Codes:** `qrcode.vue` (for 2FA setup)

## Project Structure

```text
src/
├── api/                # Axios instance and API service definitions
├── assets/             # Static assets (images, global styles)
├── components/         # Reusable UI components (Buttons, Inputs, Modals)
├── locales/            # i18n translation files (EN, ZH)
├── router/             # Vue Router configuration and navigation guards
├── stores/             # Pinia state management (Auth, Chat, Notices, etc.)
├── types/              # TypeScript interfaces and global declarations
├── utils/              # Helper functions, formatters, and cache logic
└── views/              # Page components (Dashboard, Chat, Admin panels)
```

## Getting Started

### Prerequisites

*   **Node.js** (v20+ recommended)
*   **npm** (or your preferred package manager)

### Installation

1.  Clone the repository
2.  Navigate to the frontend directory:
    ```bash
    cd ShigureCafeFronted
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the root of the frontend directory based on `.env.example`:

```env
VITE_API_PROXY_TARGET=http://localhost:8080
VITE_WS_PROXY_TARGET=ws://localhost:8080
VITE_ALLOWED_HOSTS=localhost
```

### Development

```bash
# Starts development server on http://localhost:3000
npm run dev
```

### Build

```bash
# Type-check and build for production
npm run build

# Preview production build locally
npm run preview
```
