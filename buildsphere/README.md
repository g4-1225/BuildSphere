# BuildSphere — Student Project Workspace

A frontend-only React prototype of a workspace where student teams organize projects, tasks, teammates, resources and deadlines.

> **Demo only.** There is no backend. Accounts, sessions and workspace data live in your browser's `localStorage` / `sessionStorage`. Passwords are hashed (SHA-256) before saving, but this is **not** secure authentication.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview
```

## Try the demo

- **Log in** with any valid email and any password, or **sign up** to create a demo account (that email will then require its saved password).
- **Remember me** stores the session in `localStorage` (survives closing the browser); unchecked uses `sessionStorage` (ends with the tab).
- Each email gets its own workspace seeded with sample projects. Dates are relative to today, so deadlines always look realistic.
- **Settings → Reset workspace** restores the sample data.

## Demo data management

Both options are in the profile menu (avatar, top right).

**Load Demo Data** adds 4 projects, 15 tasks, 4 teammates, 5 resource entries (file details only), 6 activity records and 3 notifications, with dates relative to today.
- Empty workspace: the sample data is added.
- Workspace with your own records: the dialog warns you, then **merges**. Your records are never changed; sample records are added alongside them and marked “Sample”.
- Demo data already present: nothing is added and the dialog says so, so repeated loads can't create duplicates.

Every demo record has an id starting with `demo-` and `demo: true`. User-created ids come from `uid()` (`project_…`, `task_…`), so they can't collide.

**Delete All Data** (type `DELETE` to confirm) clears, for the signed-in email only:
projects, tasks, teammates (except you), resources, activity, stored notifications and their read state.
It keeps your account, login session, your own profile record, theme and notification preferences, the sidebar setting, and every non-BuildSphere localStorage key. It never calls `localStorage.clear()`. The empty workspace is saved, so a refresh doesn't bring sample data back.

Both actions save to storage first and only then update React state; if the browser refuses the write, the dialog shows an error and nothing changes.

Saves from the first version of the app (`version: 1`) are migrated on load: the original sample records are marked as demo data, so Load Demo Data won't duplicate them.

## Features

| Area | What works |
| --- | --- |
| Landing | Sticky nav with smooth scrolling, interactive hero preview (tick tasks to update progress), features, how-it-works, product mockup, CTA, footer, mobile menu |
| Auth | Validation with inline errors, show/hide password, strength meter, remember me, forgot-password modal, loading states, protected routes with return-to-page |
| Dashboard | Greeting, live statistics, project cards, task panel with tabs/priority filter/sorting, upcoming deadlines, recent activity |
| Projects | Create, edit, delete (with confirmation), details modal with team and tasks, status filters, sorting |
| Tasks | Create, edit, delete, complete; status tabs, priority and project filters, "assigned to me" |
| Team | Member cards with projects, task counts and progress; add and remove members |
| Resources | Drag-and-drop or browse, file staging, open/download during the session, project filter |
| Calendar | Month grid, previous/next/today, click any deadline for details |
| Settings | Profile, light/dark/system theme, notification preferences (control the bell menu), reset |
| Shell | Collapsible sidebar, mobile drawer, global search with quick results, notifications panel, profile menu, toasts |

Accessibility: semantic landmarks, labelled inputs, accessible names on icon buttons, focus-trapped dialogs that close on Escape, keyboard-navigable menus and tabs, visible focus rings, status shown with text and icons (not color alone), and `prefers-reduced-motion` support.

## Project structure

```
src/
  components/
    common/      Button, Field (inputs, password, checkbox), Modal, ConfirmDialog,
                 Badge, ProgressBar, Avatar, ActionMenu, EmptyState, Panel, Logo
    layout/      Sidebar, Header, DashboardLayout, RouteGuards
    dashboard/   StatCard, ProjectCard, TaskItem, TaskList, DeadlinePanel,
                 ActivityPanel, ProjectDetailsModal
    forms/       AuthLayout, ProjectFormModal, TaskFormModal, MemberFormModal,
                 DemoDataDialogs
    landing/     HeroPreview, ProductMockup
  context/       AuthContext (demo auth), WorkspaceContext (all data + actions), ToastContext
  data/          mockData.js (central demo data source)
  hooks/         useDismiss.js (click-outside / Escape)
  pages/         Landing, Login, Signup, Dashboard, Projects, Tasks, Team,
                 Resources, Calendar, Settings, Help, NotFound
  styles/        landing.css, auth.css, app.css
  utils/         dateUtils.js, projectUtils.js, storage.js,
                 workspaceData.js (demo merge, clear, detection, migration)
  index.css      design tokens and shared component styles
```

## How the data flows

- `WorkspaceContext` holds projects, tasks, members, resources and activity in one state object and writes it to `localStorage` on every change.
- Project progress and all dashboard statistics are **calculated from tasks** (`utils/projectUtils.js`), so ticking a task updates every view at once.
- `DashboardLayout` owns the shared modals (new/edit project, new/edit task, project details, confirm) and passes open functions to pages through React Router's outlet context.
- Uploaded files are kept as in-memory object URLs; only their metadata is saved, so they can be opened until the page is refreshed.

## Tech

React 18, React Router 6, Vite 5, Lucide icons, plain CSS (custom properties for theming). No UI frameworks, no TypeScript, no backend.
