# Dafta Design Direction

## Inspiration Read

The UI references point toward a mobile-first product with a soft, premium, and
playful visual system. The strongest shared traits are:

- Large rounded surfaces
- Warm off-white backgrounds
- Bold black typography
- High-contrast bottom navigation
- Color-blocked cards
- Soft shadows and depth
- Friendly avatars and personal greetings
- Pill controls for filters and dates
- A strong "today" dashboard rhythm

Dafta should borrow the energy without becoming overly decorative. The app is
for memory, planning, notes, and reminders, so the interface should feel calm
first and playful second.

## Visual Positioning

Dafta should feel like:

- A premium personal notebook
- A calm daily command center
- A friendly memory assistant
- A tactile mobile object

It should not feel like:

- A corporate productivity dashboard
- A generic kanban board
- A dense note database
- A novelty AI chatbot
- A finance or delivery app clone

## Core UI Language

### Canvas

Use a warm paper-like background instead of pure white.

Recommended base colors:

- Paper: `#F7F3EA`
- Soft cream: `#FFFDF7`
- Ink: `#111318`
- Muted text: `#6F706B`
- Hairline: `#E7E0D4`

### Accent Palette

Use colorful cards sparingly so the app stays lively without becoming chaotic.

Recommended accents:

- Sun yellow: `#FFD76D`
- Sky blue: `#9DD6F0`
- Soft violet: `#A78BFA`
- Fresh lime: `#D9FF57`
- Coral: `#FF735C`
- Petal pink: `#F7A8E8`

### Shape

- App shell: very rounded mobile container
- Primary cards: 24-32px radius
- Small cards and chips: 16-22px radius
- Icon buttons: circular
- Bottom nav: pill-shaped, dark, floating

### Typography

Use confident, rounded typography with excellent readability.

Suggested direction:

- Large expressive headings
- Tight card titles
- Clear body text
- Minimal all-caps labels
- No tiny decorative copy

## Screen Concepts

### Home / Today

This should be Dafta's most important screen.

Key elements:

- Greeting and date
- Search button
- Daily focus card
- Horizontal date selector
- Top priorities
- Upcoming reminders
- Open loops
- Quick capture button

Possible hero card:

> Today asks for 3 things

The hero card can summarize what matters:

- 2 reminders due
- 1 person to follow up with
- 3 notes worth reviewing

### Inbox

The Inbox is where messy thoughts land.

UI direction:

- Big capture composer
- Voice, photo, text, and link buttons
- AI-suggested extracted actions
- Cards grouped as "unprocessed", "detected reminders", and "quick notes"

### Notes

Notes should feel calmer than the Today screen.

UI direction:

- Paper-like list
- Color accents only for notebooks or pinned notes
- Search and smart filters
- Note cards with title, preview, tags, and detected tasks

### Reminders

Reminders should feel reliable and light.

UI direction:

- Date pills
- Time blocks
- Recurring indicators
- Priority chips
- Snooze and complete actions
- "Smart timing" suggestions

### Memory

Memory is Dafta's premium differentiator.

UI direction:

- People cards
- Project cards
- Topic clusters
- "Recently resurfaced" section
- Connected notes without an intimidating graph by default

## Navigation

Use a dark floating bottom nav with 4-5 destinations:

- Today
- Inbox
- Notes
- Projects
- Memory

The capture action should be prominent, either as:

- A centered plus button in the nav
- A floating circular button above the nav
- A long press action on Inbox

## Interaction Details

Dafta should feel fast and physical:

- Cards gently lift on press
- Chips slide horizontally
- Completed tasks collapse smoothly
- Reminders can be swiped to snooze or complete
- Capture can happen from anywhere in one tap
- AI suggestions appear as editable chips, not modal interruptions

## First Prototype Direction

The first prototype should focus on:

1. Today dashboard
2. Quick capture
3. Reminder extraction
4. Notes list
5. Bottom navigation

The strongest first impression will come from a polished Today screen with
beautiful cards, date pills, and a capture flow that feels instant.

## Design Guardrails

- Keep the app mobile-first.
- Avoid cluttered dashboards.
- Do not use too many bright cards on one screen.
- Keep note-reading surfaces calm.
- Use playful color for state, priority, and delight.
- Make every screen useful immediately, not explanatory.
- Prefer icons and tactile controls over long instructional text.
