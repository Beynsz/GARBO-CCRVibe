# GARBO-CCRVibe

Smart Waste Management and Monitoring System

**What this repo is**
GARBO-CCRVibe is a web application that helps manage waste collection by providing reporting, scheduling, incident logging, and a dashboard for operations teams.

**Who this README is for**
- Non-developers who want to use the application (UI steps).
- New contributors who want to run the project locally.

**Quick overview (no-code)**
1. Ask the project owner or operations team for a hosted/demo URL. If the project is deployed, open the URL in a browser and sign in using credentials provided by the team.
2. From the app UI you can: create/report incidents, view schedules, check dashboards, and read announcements — no coding required.

**Run locally (developer steps — minimal)**
Prerequisites: Node.js (LTS), npm, and a Supabase project (or contact the maintainer for demo credentials).

- Install dependencies:

```bash
npm install
```

- Create environment variables: copy a `.env.example` (if present) or create `.env.local` with at least:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-if-needed>
```

- Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Notes about the backend and database:
- This project uses Supabase for authentication and persistence. Migration SQL files are in [supabase/migrations](supabase/migrations).
- To apply migrations locally, use the Supabase CLI or follow your team’s deployment instructions.

**Project structure (high level)**
- **App entry & routes:** [src/app/layout.tsx](src/app/layout.tsx)
- **Public-facing pages:** [src/app/(public)/page.tsx](src/app/(public)/page.tsx)
- **Auth flows:** [src/app/(auth)/](src/app/(auth)/)
- **Dashboard & features:** [src/app/(dashboard)/layout.tsx](src/app/(dashboard)/layout.tsx)
- **UI components:** [src/components/organisms](src/components/organisms)
- **Services / API wrappers:** [src/services](src/services)
- **Supabase helpers:** [supabase/client.ts](supabase/client.ts) and [supabase/server.ts](supabase/server.ts)

**Common tasks (for non-developers)**
- To report issues or request a demo, open an Issue on GitHub or contact the project owner listed in the repository settings.
- To view system documentation, check [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) and [REPORTS.md](REPORTS.md).

**Contributing**
- New contributors: fork, create a branch, and open a pull request with a clear description of changes.
- If you're not a coder but want to help: you can test the UI, create issues with steps to reproduce, write screenshots, or help with documentation.

**Support & contact**
- Repository owner/maintainers: see the GitHub repo page for contacts. If this repo is internal, ask your team lead for access or a demo link.

**License**
- Check for a `LICENSE` file in the repo. If none exists, contact the project owner to clarify usage and contribution terms.

---

If you want, I can add a short `CONTRIBUTING.md`, a `.env.example`, or a quick-start video/screenshots for non-developers — tell me which one you prefer.
