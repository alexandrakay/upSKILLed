# Plan: upSKILLed

**PRD**: In conversation (revised May 24, 2026)
**Repo**: alexandrakay/upSKILLed
**Created**: 2026-05-24

---

## Decisions

### Routes
- `GET /` — Landing page (thin placeholder first, full version Thursday)
- `GET /generate` — Main generation UI (3 tabs: Service, Tool, Custom)
- `POST /api/generate` — Generation endpoint (rate-limited, server-side only)

### Schema

```
users/{uid}
  - email: string
  - createdAt: timestamp
  - tier: "free" | "auth"

usage/{identifier}          # IP for anon, uid for auth
  - count: number
  - resetAt: timestamp      # midnight UTC
  - lastGeneratedAt: timestamp

generations/{id}
  - path: "service" | "tool" | "custom"
  - input: string           # service name, tool name, or description text
  - useCase: string
  - createdAt: timestamp
  - uid: string | null      # null for anonymous (no IP stored)
```

### Key Models

**Generation request**
```json
{ "path": "service" | "tool" | "custom", "input": "...", "useCase": "..." }
```

**Claude response (parsed from JSON)**
```json
{
  "skill": { "name", "description", "capabilities", "markdownContent" },
  "config": { "name", "version", "service", "auth", "baseUrl", "tools" },
  "examples": [{ "prompt", "description" }]
}
```

**Output files** — named `{config.name}-skill.md`, `{config.name}-config.json`, `{config.name}-examples.md`. Name sanitized to lowercase hyphenated slug. Optional `--name` flag overrides inferred name on CLI.

### Service Boundaries
- **Anthropic API** (`claude-sonnet-4-20250514`) — all skill generation, called server-side only. Prompt caching enabled on system prompt + curated definition blocks. App's API key for web; user's `ANTHROPIC_API_KEY` (or `--key` flag) for CLI.
- **Firebase Auth** — Google OAuth via `signInWithPopup` (no page navigation) + email magic link. Auth modal is a shadcn `Dialog`, not a dedicated page.
- **Firestore** — rate limiting (atomic transactions), generation logging, user records. Server-side writes only from the API route.
- **Vercel** — hosting + serverless functions. `maxDuration: 30` on `/api/generate`. Auto-deploys on push to `main`. Domain: `getupskilled.dev`.
- **npm** — CLI package distribution. First publish at `0.1.0` when service path works; `1.0.0` on Friday after smoke test.

### Tech Choices
- **Monorepo**: Turborepo with `packages/core`, `packages/cli`, `packages/web`
- **Module format**: ESM (`"type": "module"`) throughout all packages
- **UI**: Next.js 14 App Router + Tailwind CSS + shadcn/ui, dark mode only
- **Syntax highlighting**: shiki (output panel file tabs)
- **Logos**: `simple-icons` for API services, `lucide-react` terminal icon for CLI tools
- **Zip download**: JSZip
- **JSON repair**: regex fence-strip → `jsonrepair` → one retry with explicit schema reminder
- **Output persistence**: `localStorage` for last generation (all users, Week 4); Firestore history for paid tier (future)
- **Versioning**: `0.1.0` → patch bumps mid-week → `1.0.0` on Friday

---

## Phase 1: Monorepo Scaffold + CLI Skeleton

**User stories**: Developer can install and run `upskilled` from the terminal

### What to build
Initialize the Turborepo monorepo with three packages: `core`, `cli`, and `web`. Wire up the CLI entry point with `commander` so `upskilled --version` and `upskilled --help` print correctly. Scaffold the Next.js app with Tailwind and shadcn initialized. Confirm `packages/core` is importable from both `packages/cli` and `packages/web`. Set up Firebase project (Auth + Firestore) and add all environment variables to Vercel.

### Acceptance criteria
- [ ] `turbo dev` starts both the CLI watcher and the Next.js dev server
- [ ] `upskilled --version` prints the current package version
- [ ] `upskilled --help` lists all flags: `--service`, `--tool`, `--describe`, `--help-output`, `--help-file`, `--use`, `--output`, `--name`, `--key`
- [ ] `packages/core` exports without errors when imported by `packages/cli`
- [ ] Next.js app runs locally with Tailwind and shadcn installed
- [ ] Firebase project created with Auth (Google + email link) and Firestore enabled
- [ ] `ANTHROPIC_API_KEY` and Firebase config env vars added to Vercel

---

## Phase 2: End-to-End Generation — Service Path

**User stories**: Developer runs `upskilled --service github --use "manage issues and PRs"` and receives 3 correct output files

### What to build
Build the full generation pipeline for the service path end-to-end: rich curated definitions for all 10 services in `packages/core`, the Anthropic API call with prompt caching on the system prompt and service definition block, JSON response parsing with regex strip → `jsonrepair` → retry, and file writing to the output directory. File names derived from `config.name` slug with optional `--name` override. This is the first shippable state — publish `0.1.0` to npm when this phase passes.

### Acceptance criteria
- [ ] All 10 service definitions exist with rich context (auth, base URL, 8–12 capabilities, common use cases, docs URL)
- [ ] `upskilled --service github --use "manage issues"` produces `github-skill.md`, `github-config.json`, `github-examples.md` in the current directory
- [ ] `--output ./skills` writes files to the specified directory
- [ ] `--name my-skill` overrides the inferred file name prefix
- [ ] Generated `skill.md` is usable as-is in a Claude project
- [ ] Generated `examples.md` contains at least 5 meaningful prompts
- [ ] Generated `config.json` is valid JSON with no missing required fields
- [ ] Missing `ANTHROPIC_API_KEY` exits with: `"Set ANTHROPIC_API_KEY or use --key flag"`
- [ ] Prompt caching headers present on system prompt block
- [ ] `0.1.0` published to npm and `npx upskilled --service github --use "test"` works

---

## Phase 3: CLI Complete — All Input Paths

**User stories**: Developer can generate skills via tool path, custom description, and `--help` paste

### What to build
Extend the generation pipeline to cover all remaining input paths. Add rich curated definitions for all 8 CLI tools. Wire up `--tool`, `--describe`, `--help-output`, and `--help-file` flags. `--help-file` reads from a file path (cross-platform). `--help-output` accepts shell-substituted text directly. Both feed the same `--help` prompt strategy. Truncate inputs exceeding 32KB with a console warning. All 4 prompt strategies use prompt caching on the system prompt block.

### Acceptance criteria
- [ ] All 8 CLI tool definitions exist with rich context (flags, use cases, output formats)
- [ ] `upskilled --tool ffuf --use "fuzz web directories"` produces 3 correct files
- [ ] `upskilled --describe "a REST API for sending SMS" --use "send alerts"` produces 3 correct files
- [ ] `upskilled --help-output "$(ffuf --help)" --use "directory fuzzing"` produces 3 correct files
- [ ] `upskilled --help-file ./ffuf-help.txt --use "directory fuzzing"` produces identical output
- [ ] `--help-output` input over 32KB is truncated with a console warning
- [ ] `jsonrepair` fallback and one-retry flow tested with a deliberately malformed mock response
- [ ] All paths smoke tested across all 10 services and 8 CLI tools

---

## Phase 4: Web API Route + Rate Limiting

**User stories**: Web app can generate skills server-side with anonymous usage limits enforced

### What to build
Build `POST /api/generate` as a Next.js Route Handler that accepts all 3 input paths, calls the shared `packages/core` generation logic, and returns the 3 file contents as JSON. Implement rate limiting via Firestore atomic transactions: read + increment `usage/{identifier}` in a single transaction, where identifier is the request IP for anonymous users or Firebase UID for authenticated users. Return 429 with reset timestamp when the 3/day limit is exceeded. Log all generations to `generations/{id}` — anonymous generations store no IP. Set `maxDuration: 30` on the route.

### Acceptance criteria
- [ ] `POST /api/generate` returns `{ skillContent, configContent, examplesContent, name }` for all 3 paths
- [ ] Anonymous users blocked at 3 generations/day by IP with a 429 response containing `resetAt`
- [ ] Authenticated users bypass rate limit entirely
- [ ] Firestore `usage` document incremented atomically (concurrent requests cannot both slip through)
- [ ] All generations logged to `generations/{id}` with `uid: null` and no IP for anonymous requests
- [ ] Firestore security rules: `users/{uid}` readable/writable by owner only; `usage` and `generations` server-side write only
- [ ] Route responds within 30 seconds for all input sizes (verified with `--help` paste)
- [ ] 400 returned for missing `use` field or unrecognized `path` value

---

## Phase 5: Generate Page UI

**User stories**: User can generate a skill via the web app and download the output

### What to build
Build `/generate` with 3 tabs (shadcn `Tabs`): Service picker grid (10 services with `simple-icons` logos), CLI tool picker grid (security section + UI/CLI section, `lucide-react` terminal icon), and Custom tab (radio toggle between "Describe it" textarea and "Paste --help" textarea). Shared use case field and Generate button below all tabs. Output panel appears after generation: 3 file tabs with shiki-highlighted content, copy-to-clipboard button per tab, individual file download per tab, "Download all as .zip" button (JSZip). Last generation persisted to `localStorage` and restored on page load. Usage counter shown after first generation: `"X of 3 generations used today"`. Generate button disabled and sign-in prompt shown when limit is reached.

### Acceptance criteria
- [ ] All 3 tabs render correctly; selecting a service/tool highlights it and enables Generate
- [ ] Custom tab radio toggle switches between describe textarea and paste textarea
- [ ] Generate button calls `POST /api/generate` and shows a loading spinner during generation
- [ ] Output panel renders with 3 file tabs after successful generation
- [ ] shiki syntax highlighting renders for JSON and markdown file types
- [ ] Copy button copies raw file content to clipboard
- [ ] Individual file download triggers a browser download with correct filename and extension
- [ ] "Download all as .zip" downloads a zip containing all 3 files (JSZip)
- [ ] Last generation restored from `localStorage` on page reload
- [ ] Usage counter appears after first generation and updates after each subsequent one
- [ ] Generate button disabled with sign-in prompt when anonymous limit reached

---

## Phase 6: Firebase Auth

**User stories**: User can sign in to unlock unlimited generations

### What to build
Add a sign-in modal (shadcn `Dialog`) triggered when an anonymous user hits their limit or clicks a persistent "Sign in" button in the nav. Modal contains Google OAuth button (`signInWithPopup` — no page navigation) and email magic link input. On successful auth, modal closes, usage counter disappears, and the user can generate immediately. Create `users/{uid}` document in Firestore on first sign-in. Auth state persisted across sessions via Firebase's built-in persistence. Sign-out option in nav.

### Acceptance criteria
- [ ] "Sign in" button visible in nav at all times
- [ ] Sign-in modal opens when anonymous user exhausts 3 generations
- [ ] Google OAuth completes via popup (no page navigation or redirect)
- [ ] Email magic link sends a Firebase auth email and completes sign-in when link is opened in the same browser
- [ ] `users/{uid}` document created in Firestore on first successful sign-in
- [ ] Authenticated user can generate without limit; usage counter hidden
- [ ] Sign-out returns user to anonymous state; counter reappears on next generation
- [ ] Auth state persists across page refreshes

---

## Phase 7: Landing Page

**User stories**: Visitor understands upSKILLed and knows how to get started

### What to build
First: deploy a thin placeholder at `/` — headline, tagline, and a CTA button to `/generate`. This unblocks the Medium article screenshot. Then on Thursday: expand to the full landing page with three category cards (APIs, CLI Tools, Custom), service/tool logo grid, npm install code snippet, and CTA.

### Acceptance criteria
- [ ] Thin placeholder: headline ("Claude, upSKILLed."), tagline, and "Try it →" button render at `/`
- [ ] Full landing page: three category cards with descriptions render correctly
- [ ] Service logos (simple-icons) and CLI tool icons (lucide-react) display in the logo grid
- [ ] `npm install -g upskilled` code snippet is copyable
- [ ] CTA navigates to `/generate`
- [ ] Page looks correct on mobile and desktop

---

## Phase 8: Ship

**User stories**: upSKILLed is publicly available and production-ready

### What to build
Final smoke test of all paths in production. Bump version to `1.0.0`, publish to npm. Verify `getupskilled.dev` is live and all flows work end-to-end. Verify rate limiting, auth, and zip download in production.

### Acceptance criteria
- [ ] `upskilled@1.0.0` published to npm; `npm install -g upskilled` installs the latest version
- [ ] `npx upskilled --service github --use "manage issues"` works without a global install
- [ ] All 10 services smoke tested via CLI
- [ ] All 8 CLI tools smoke tested via CLI
- [ ] `getupskilled.dev` loads with correct landing page
- [ ] Service path, tool path, and custom path all generate correctly on the live web app
- [ ] Anonymous rate limiting works in production (3/day by IP)
- [ ] Google sign-in and email magic link both work in production
- [ ] Zip download works in production
- [ ] Medium article published with live links
- [ ] LinkedIn post published

---

## Build Schedule

| Day | Date | Phases |
|---|---|---|
| Sunday night | May 25 | Firebase setup, Vercel env vars, start Phase 1 |
| Monday | May 26 | Phase 1 complete — monorepo scaffold |
| Tuesday | May 27 | Phase 2 complete — service path working, `0.1.0` on npm |
| Wednesday | May 28 | Phase 3 + Phase 4 — CLI complete, web API + rate limiting |
| Thursday | May 29 | Phase 5 + Phase 6 + Phase 7 — web UI, auth, landing page |
| Friday | May 30 | Phase 8 — smoke test, `1.0.0` on npm, ship |
| Weekend | May 31–Jun 1 | Medium article, LinkedIn post, X thread |
