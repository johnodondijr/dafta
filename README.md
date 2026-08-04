# Dafta

Dafta is a premium notes and reminders app inspired by the Swahili word
`daftari`, meaning notebook.

It is designed to be more than a place to write things down. Dafta turns
scattered thoughts into remembered action: notes, reminders, follow-ups,
projects, daily plans, and connected memory in one calm workspace.

## Product Direction

Dafta combines the best parts of:

- Fast note capture
- Smart reminders
- Daily planning
- Project notebooks
- Follow-up tracking
- Connected personal memory
- AI-assisted organization

The goal is not to become a bloated productivity suite. The goal is to feel
fast, beautiful, intelligent, and trustworthy.

## Core Screens

- **Inbox**: quick capture for messy thoughts, links, voice notes, photos, and ideas.
- **Today**: calendar, reminders, top priorities, and focus sessions.
- **Notes**: beautiful long-form notes, tags, backlinks, attachments, and search.
- **Projects**: notes, tasks, reminders, and deadlines grouped around outcomes.
- **Memory**: people, places, themes, commitments, and resurfaced context.

## Premium Differentiators

- Natural-language capture for notes and reminders.
- AI extraction of tasks, dates, people, and follow-ups from notes.
- Context-aware reminders based on time, place, calendar, and availability.
- A follow-up engine that tracks open loops and unfinished commitments.
- Note-to-action conversion: generate checklists, reminders, summaries, and plans.
- Connected memory graph for notes, people, projects, and recurring themes.
- Calm daily command center that helps users decide what matters today.
- Local-first or export-friendly data strategy to avoid lock-in.

## Product Principles

- Capture must be nearly instant.
- Planning must feel calm, not punishing.
- Notes and tasks should live together without making either worse.
- AI should reduce mental load quietly.
- The app should be beautiful enough to love and simple enough to keep using.

## Design Direction

Dafta is mobile-first, warm, tactile, and premium. The visual language uses a
paper-like canvas, bold typography, rounded cards, colorful but restrained
accent surfaces, pill controls, and a dark floating bottom navigation.

See `docs/design-direction.md` for the evolving UI direction.

## Preview App

Dafta now includes a static React preview designed for GitHub Pages. It supports
interactive tabs for Today, Inbox, Notes, Projects, and Memory, plus a quick
capture flow that detects simple reminder-like entries.

```bash
npm install
npm run dev
```

The GitHub Pages workflow builds the preview into `dist-pages` whenever changes
are pushed to `main`.

## Initial Roadmap

1. Define brand, UI direction, and interaction model.
2. Build the core data model for notes, reminders, tasks, projects, and people.
3. Prototype the Inbox and Today screens.
4. Add natural-language reminder capture.
5. Add note-to-task extraction and follow-up detection.
6. Add project notebooks and connected note relationships.
7. Add sync, export, and privacy controls.

## Working Tagline

Notes that remember with you.
