import { FormEvent, useEffect, useMemo, useState } from "react";

type Tab = "Today" | "Inbox" | "Notes" | "Calendar" | "Projects" | "Memory";
type EntryKind = "note" | "reminder";

type Entry = {
  id: number;
  kind: EntryKind;
  title: string;
  body: string;
  time?: string;
  tag: string;
  done?: boolean;
  createdAt: string;
  updatedAt: string;
  person?: string;
  project?: string;
  date?: string;
};

type EntryDraft = {
  kind: EntryKind;
  title: string;
  body: string;
  time: string;
  tag: string;
  person: string;
  project: string;
  date: string;
};

const storageKey = "dafta.entries.v1";

const seedEntries: Entry[] = [
  {
    id: 1,
    kind: "reminder",
    title: "Send proposal notes to Amina",
    body: "Pulled from yesterday's project note.",
    time: "09:30",
    tag: "Follow-up",
    person: "Amina",
    project: "Dafta v1",
    date: "2026-08-04",
    createdAt: "2026-08-04T09:00:00.000Z",
    updatedAt: "2026-08-04T09:00:00.000Z",
  },
  {
    id: 2,
    kind: "reminder",
    title: "Review UI inspirations",
    body: "Turn references into reusable Dafta components.",
    time: "12:00",
    tag: "Design",
    project: "Dafta v1",
    date: "2026-08-04",
    createdAt: "2026-08-04T10:00:00.000Z",
    updatedAt: "2026-08-04T10:00:00.000Z",
  },
  {
    id: 3,
    kind: "note",
    title: "Dafta product ideas",
    body: "Follow-up engine, smart reminders, daily command center, memory graph.",
    tag: "Product",
    project: "Dafta v1",
    date: "2026-08-04",
    createdAt: "2026-08-04T11:00:00.000Z",
    updatedAt: "2026-08-04T11:00:00.000Z",
  },
  {
    id: 4,
    kind: "note",
    title: "People to check in with",
    body: "Sarah, Amina, Kevin, and the design feedback thread.",
    tag: "People",
    person: "Sarah",
    date: "2026-08-05",
    createdAt: "2026-08-04T12:00:00.000Z",
    updatedAt: "2026-08-04T12:00:00.000Z",
  },
];

const tabs: Tab[] = ["Today", "Inbox", "Notes", "Calendar", "Projects", "Memory"];

const monthStart = new Date("2026-08-01T00:00:00");
const selectedMonthLabel = "August 2026";

function makeMonthDays() {
  return Array.from({ length: 31 }, (_, index) => {
    const date = new Date(monthStart);
    date.setDate(index + 1);

    return {
      date,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      label: String(index + 1).padStart(2, "0"),
      key: toDateKey(date),
    };
  });
}

const monthDays = makeMonthDays();

function loadEntries() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Entry[]) : seedEntries;
  } catch {
    return seedEntries;
  }
}

function makeEmptyDraft(kind: EntryKind = "note"): EntryDraft {
  return {
    kind,
    title: "",
    body: "",
    time: "",
    tag: kind === "reminder" ? "Reminder" : "Note",
    person: "",
    project: "",
    date: "2026-08-04",
  };
}

function parseCapture(text: string): EntryDraft {
  const reminderMatch = text.match(/\b(remind|call|send|review|buy|pay|email)\b/i);
  const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const personMatch = text.match(/\b(?:with|to|call|email|send)\s+([A-Z][a-z]+)/);
  const projectMatch = text.match(/#([a-z0-9-]+)/i);
  const kind = reminderMatch ? "reminder" : "note";
  const normalizedTitle = text.replace(/#([a-z0-9-]+)/gi, "").trim();

  return {
    kind,
    title:
      normalizedTitle.length > 56
        ? `${normalizedTitle.slice(0, 56)}...`
        : normalizedTitle,
    body: reminderMatch
      ? "Dafta detected this as something to act on."
      : "Captured in Inbox. Ready to organize when you are.",
    time: timeMatch?.[0] ?? (reminderMatch ? "Soon" : ""),
    tag: projectMatch?.[1] ?? (reminderMatch ? "Detected" : "Inbox"),
    person: personMatch?.[1] ?? "",
    project: projectMatch?.[1] ? titleCase(projectMatch[1]) : "",
    date: "2026-08-04",
  };
}

function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Today");
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [draft, setDraft] = useState("");
  const [captureDetailsOpen, setCaptureDetailsOpen] = useState(false);
  const [captureDraft, setCaptureDraft] = useState<EntryDraft>(() => ({
    ...makeEmptyDraft("note"),
    date: "2026-08-04",
  }));
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-08-04");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [editorDraft, setEditorDraft] = useState<EntryDraft>(makeEmptyDraft());

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    setCaptureDraft((current) => ({ ...current, date: selectedDate }));
  }, [selectedDate]);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return entries;
    }

    return entries.filter((entry) =>
      [entry.title, entry.body, entry.tag, entry.person, entry.project]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle)),
    );
  }, [entries, query]);

  const reminders = useMemo(
    () => filteredEntries.filter((entry) => entry.kind === "reminder"),
    [filteredEntries],
  );

  const notes = useMemo(
    () => filteredEntries.filter((entry) => entry.kind === "note"),
    [filteredEntries],
  );

  const allReminders = entries.filter((entry) => entry.kind === "reminder");
  const allNotes = entries.filter((entry) => entry.kind === "note");
  const selectedDateEntries = filteredEntries.filter(
    (entry) => (entry.date ?? "2026-08-04") === selectedDate,
  );
  const selectedDateReminders = selectedDateEntries.filter(
    (entry) => entry.kind === "reminder",
  );
  const openLoops = allReminders.filter((entry) => !entry.done).length;
  const nextReminder =
    selectedDateReminders.find((entry) => !entry.done) ??
    allReminders.find((entry) => !entry.done);
  const projects = summarizeBy(entries, "project", "No project");
  const people = summarizeBy(entries, "person", "Unassigned");

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    const parsed = parseCapture(text);
    const kind =
      captureDraft.kind === "reminder" || parsed.kind === "reminder"
        ? "reminder"
        : "note";
    const now = new Date().toISOString();
    const nextEntry: Entry = {
      id: Date.now(),
      kind,
      title: parsed.title,
      body: captureDraft.body.trim() || parsed.body,
      time:
        kind === "reminder"
          ? captureDraft.time.trim() || parsed.time || "Soon"
          : undefined,
      tag: captureDraft.tag.trim() || parsed.tag,
      person: captureDraft.person.trim() || parsed.person || undefined,
      project: captureDraft.project.trim() || parsed.project || undefined,
      createdAt: now,
      updatedAt: now,
      date: captureDraft.date || selectedDate,
    };

    setEntries((current) => [nextEntry, ...current]);
    setDraft("");
    setCaptureDraft((current) => ({
      ...makeEmptyDraft(current.kind),
      date: selectedDate,
    }));
    setCaptureDetailsOpen(false);
    setSelectedEntry(nextEntry);
    setEditorDraft(entryToDraft(nextEntry));
    setActiveTab("Inbox");
  }

  function openEditor(entry: Entry) {
    setSelectedEntry(entry);
    setEditorDraft(entryToDraft(entry));
  }

  function saveSelectedEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEntry || !editorDraft.title.trim()) {
      return;
    }

    const updatedEntry: Entry = {
      ...selectedEntry,
      kind: editorDraft.kind,
      title: editorDraft.title.trim(),
      body: editorDraft.body.trim(),
      time: editorDraft.kind === "reminder" ? editorDraft.time.trim() || "Soon" : undefined,
      tag: editorDraft.tag.trim() || (editorDraft.kind === "reminder" ? "Reminder" : "Note"),
      person: editorDraft.person.trim() || undefined,
      project: editorDraft.project.trim() || undefined,
      updatedAt: new Date().toISOString(),
      date: editorDraft.date || selectedEntry.date || selectedDate,
    };

    setEntries((current) =>
      current.map((entry) => (entry.id === selectedEntry.id ? updatedEntry : entry)),
    );
    setSelectedEntry(updatedEntry);
  }

  function deleteSelectedEntry() {
    if (!selectedEntry) {
      return;
    }

    setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
    setSelectedEntry(null);
  }

  function toggleDone(id: number) {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id
          ? { ...entry, done: !entry.done, updatedAt: new Date().toISOString() }
          : entry,
      ),
    );
  }

  function resetData() {
    setEntries(seedEntries);
    setSelectedEntry(null);
    setQuery("");
    setSelectedDate("2026-08-04");
    setCaptureDraft({ ...makeEmptyDraft("note"), date: "2026-08-04" });
  }

  function openCalendarForDate(dateKey: string) {
    setSelectedDate(dateKey);
    setActiveTab("Calendar");
  }

  return (
    <main className="site-shell">
      <section className="phone-frame" aria-label="Dafta app preview">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span>{entries.length} saved</span>
        </div>

        <header className="topbar">
          <button className="avatar" aria-label="Open profile">
            D
          </button>
          <div>
            <p className="eyebrow">Hello, Sarah</p>
            <h1>{activeTab}</h1>
          </div>
          <button className="icon-button" onClick={resetData}>
            Reset
          </button>
        </header>

        <label className="search-box">
          <span>Search Dafta</span>
          <input
            aria-label="Search Dafta"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes, people, projects..."
            value={query}
          />
        </label>

        {activeTab === "Today" && (
          <>
            <section className="hero-card" aria-label="Today summary">
              <div className="hero-copy">
                <p className="eyebrow">Tuesday, 04 Aug</p>
                <h2>Today asks for {Math.max(openLoops, 1)} things</h2>
                <p>
                  {nextReminder
                    ? `Next: ${nextReminder.title}`
                    : "No open reminders. Capture the next thing before it drifts."}
                </p>
              </div>
              <div className="memory-orbit" aria-hidden="true">
                <span className="orb orb-one" />
                <span className="orb orb-two" />
                <span className="orb orb-three" />
                <span className="orb orb-four" />
              </div>
              <div className="hero-metrics">
                <span>{openLoops} due</span>
                <span>{people.length} people</span>
                <span>{allNotes.length} notes</span>
              </div>
            </section>

            <nav className="date-strip" aria-label="August date selector">
              {monthDays.map(({ day, label, key }) => (
                <button
                  className={key === selectedDate ? "date-pill active" : "date-pill"}
                  key={key}
                  onClick={() => setSelectedDate(key)}
                >
                  <span>{day}</span>
                  <strong>{label}</strong>
                </button>
              ))}
            </nav>
            <button
              className="calendar-link"
              onClick={() => setActiveTab("Calendar")}
            >
              View full calendar
            </button>

            <CaptureForm
              captureDetailsOpen={captureDetailsOpen}
              draft={draft}
              entryDraft={captureDraft}
              selectedDate={selectedDate}
              setCaptureDetailsOpen={setCaptureDetailsOpen}
              setDraft={setDraft}
              setEntryDraft={setCaptureDraft}
              onSubmit={addEntry}
            />
            <ReminderList
              reminders={selectedDateReminders}
              openEditor={openEditor}
              toggleDone={toggleDone}
            />
          </>
        )}

        {activeTab === "Inbox" && (
          <section className="screen-stack">
            <CaptureForm
              captureDetailsOpen={captureDetailsOpen}
              draft={draft}
              entryDraft={captureDraft}
              selectedDate={selectedDate}
              setCaptureDetailsOpen={setCaptureDetailsOpen}
              setDraft={setDraft}
              setEntryDraft={setCaptureDraft}
              onSubmit={addEntry}
            />
            <SectionTitle title="Captured" action={`${filteredEntries.length} items`} />
            {filteredEntries.map((entry, index) => (
              <EntryCard
                entry={entry}
                key={entry.id}
                openEditor={openEditor}
                tone={["yellow", "blue", "violet"][index % 3]}
                toggleDone={toggleDone}
              />
            ))}
          </section>
        )}

        {activeTab === "Notes" && (
          <section className="screen-stack">
            <SectionTitle title="Notes" action={`${notes.length} notes`} />
            <div className="notes-grid">
              {notes.map((entry) => (
                <button
                  className="note-card"
                  key={entry.id}
                  onClick={() => openEditor(entry)}
                >
                  <span>{entry.tag}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.body}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === "Calendar" && (
          <section className="screen-stack">
            <section className="calendar-hero">
              <p className="eyebrow">{selectedMonthLabel}</p>
              <h2>{formatDateLabel(selectedDate)}</h2>
              <p>
                {selectedDateEntries.length
                  ? `${selectedDateEntries.length} saved items for this day.`
                  : "No notes or reminders for this day yet."}
              </p>
            </section>

            <div className="month-grid" aria-label="Full August calendar">
              {monthDays.map(({ label, key }) => {
                const dayItems = entries.filter((entry) => entry.date === key);
                const hasOpenReminder = dayItems.some(
                  (entry) => entry.kind === "reminder" && !entry.done,
                );

                return (
                  <button
                    className={[
                      "month-day",
                      key === selectedDate ? "active" : "",
                      dayItems.length ? "has-items" : "",
                    ].join(" ")}
                    key={key}
                    onClick={() => openCalendarForDate(key)}
                  >
                    <strong>{label}</strong>
                    {dayItems.length > 0 && <span>{dayItems.length}</span>}
                    {hasOpenReminder && <i aria-label="Open reminder" />}
                  </button>
                );
              })}
            </div>

            <SectionTitle
              title="This day"
              action={`${selectedDateEntries.length} items`}
            />
            <CaptureForm
              captureDetailsOpen={captureDetailsOpen}
              draft={draft}
              entryDraft={{ ...captureDraft, date: selectedDate }}
              selectedDate={selectedDate}
              setCaptureDetailsOpen={setCaptureDetailsOpen}
              setDraft={setDraft}
              setEntryDraft={setCaptureDraft}
              onSubmit={addEntry}
            />
            {selectedDateEntries.map((entry, index) => (
              <EntryCard
                entry={entry}
                key={entry.id}
                openEditor={openEditor}
                tone={["yellow", "blue", "violet"][index % 3]}
                toggleDone={toggleDone}
              />
            ))}
            {!selectedDateEntries.length && (
              <section className="empty-day">
                <h3>Clear day</h3>
                <p>Capture a note or reminder and Dafta will pin it here.</p>
              </section>
            )}
          </section>
        )}

        {activeTab === "Projects" && (
          <section className="screen-stack">
            <SectionTitle title="Projects" action={`${projects.length} active`} />
            {projects.map((project, index) => (
              <article className="project-card" key={project.name}>
                <span>{project.count} items</span>
                <h3>{project.name}</h3>
                <p>
                  {project.openLoops} open loops. {project.latest}
                </p>
                <div className="progress-track">
                  <span style={{ width: `${Math.max(18, 100 - project.openLoops * 18)}%` }} />
                </div>
                <button onClick={() => setQuery(project.name)}>
                  Filter project {index + 1}
                </button>
              </article>
            ))}
          </section>
        )}

        {activeTab === "Memory" && (
          <section className="screen-stack">
            <section className="memory-card">
              <p className="eyebrow">Memory</p>
              <h2>Open loops worth remembering</h2>
              <p>
                Dafta connects reminders, notes, people, and projects from what
                you capture locally in this browser.
              </p>
            </section>
            {people.map((person) => (
              <article className="person-row" key={person.name}>
                <span>{person.name.charAt(0)}</span>
                <div>
                  <h3>{person.name}</h3>
                  <p>
                    {person.count} items, {person.openLoops} open loops
                  </p>
                </div>
                <button onClick={() => setQuery(person.name)}>View</button>
              </article>
            ))}
          </section>
        )}

        <nav className="bottom-nav" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? "active" : ""}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              <span aria-hidden="true">{tab.charAt(0)}</span>
              <strong>{tab}</strong>
            </button>
          ))}
        </nav>
      </section>

      {selectedEntry && (
        <EntryEditor
          draft={editorDraft}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={deleteSelectedEntry}
          onDraftChange={setEditorDraft}
          onSave={saveSelectedEntry}
        />
      )}
    </main>
  );
}

function summarizeBy(entries: Entry[], key: "person" | "project", fallback: string) {
  const groups = new Map<string, Entry[]>();

  entries.forEach((entry) => {
    const name = entry[key] || fallback;
    groups.set(name, [...(groups.get(name) ?? []), entry]);
  });

  return [...groups.entries()]
    .map(([name, group]) => ({
      name,
      count: group.length,
      openLoops: group.filter((entry) => entry.kind === "reminder" && !entry.done).length,
      latest: group[0]?.title ?? "No recent activity",
    }))
    .sort((a, b) => b.openLoops - a.openLoops || b.count - a.count);
}

function entryToDraft(entry: Entry): EntryDraft {
  return {
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    time: entry.time ?? "",
    tag: entry.tag,
    person: entry.person ?? "",
    project: entry.project ?? "",
    date: entry.date ?? "2026-08-04",
  };
}

function CaptureForm({
  captureDetailsOpen,
  draft,
  entryDraft,
  selectedDate,
  setCaptureDetailsOpen,
  setDraft,
  setEntryDraft,
  onSubmit,
}: {
  captureDetailsOpen: boolean;
  draft: string;
  entryDraft: EntryDraft;
  selectedDate: string;
  setCaptureDetailsOpen: (value: boolean) => void;
  setDraft: (value: string) => void;
  setEntryDraft: (draft: EntryDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="quick-capture" onSubmit={onSubmit}>
      <label>
        <span className="eyebrow">Quick capture for {formatDateLabel(selectedDate)}</span>
        <input
          aria-label="Quick capture"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Remind me to review notes at 12:00 #dafta"
          value={draft}
        />
      </label>
      <button>Add</button>
      <button
        className="details-toggle"
        type="button"
        onClick={() => setCaptureDetailsOpen(!captureDetailsOpen)}
      >
        {captureDetailsOpen ? "Hide details" : "Add details"}
      </button>
      {captureDetailsOpen && (
        <div className="capture-details">
          <label>
            Type
            <select
              value={entryDraft.kind}
              onChange={(event) =>
                setEntryDraft({
                  ...entryDraft,
                  kind: event.target.value as EntryKind,
                })
              }
            >
              <option value="note">Note</option>
              <option value="reminder">Reminder</option>
            </select>
          </label>
          <label>
            Date
            <select
              value={entryDraft.date || selectedDate}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, date: event.target.value })
              }
            >
              {monthDays.map(({ day, label, key }) => (
                <option key={key} value={key}>
                  {day} {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Time
            <input
              placeholder="09:30"
              value={entryDraft.time}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, time: event.target.value })
              }
            />
          </label>
          <label>
            Person
            <input
              placeholder="Amina"
              value={entryDraft.person}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, person: event.target.value })
              }
            />
          </label>
          <label>
            Project
            <input
              placeholder="Dafta v1"
              value={entryDraft.project}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, project: event.target.value })
              }
            />
          </label>
          <label>
            Tag
            <input
              placeholder="Follow-up"
              value={entryDraft.tag}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, tag: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Details
            <textarea
              rows={3}
              placeholder="Anything useful to remember..."
              value={entryDraft.body}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, body: event.target.value })
              }
            />
          </label>
        </div>
      )}
    </form>
  );
}

function ReminderList({
  reminders,
  openEditor,
  toggleDone,
}: {
  reminders: Entry[];
  openEditor: (entry: Entry) => void;
  toggleDone: (id: number) => void;
}) {
  return (
    <section className="content-section">
      <SectionTitle title="Reminders" action={`${reminders.length} total`} />
      <div className="reminder-list">
        {reminders.map((entry, index) => (
          <EntryCard
            entry={entry}
            key={entry.id}
            openEditor={openEditor}
            tone={["yellow", "blue", "violet"][index % 3]}
            toggleDone={toggleDone}
          />
        ))}
      </div>
    </section>
  );
}

function EntryCard({
  entry,
  tone = "yellow",
  openEditor,
  toggleDone,
}: {
  entry: Entry;
  tone?: string;
  openEditor: (entry: Entry) => void;
  toggleDone: (id: number) => void;
}) {
  return (
    <article className={`reminder-card ${tone} ${entry.done ? "done" : ""}`}>
      <button className="entry-time" onClick={() => openEditor(entry)}>
        {entry.time ?? entry.tag}
      </button>
      <button className="entry-body" onClick={() => openEditor(entry)}>
        <h3>{entry.title}</h3>
        <p>{entry.body}</p>
      </button>
      {entry.kind === "reminder" && (
        <button onClick={() => toggleDone(entry.id)}>
          {entry.done ? "Undo" : "Done"}
        </button>
      )}
    </article>
  );
}

function EntryEditor({
  draft,
  entry,
  onClose,
  onDelete,
  onDraftChange,
  onSave,
}: {
  draft: EntryDraft;
  entry: Entry;
  onClose: () => void;
  onDelete: () => void;
  onDraftChange: (draft: EntryDraft) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="editor-sheet" aria-label="Edit entry">
        <div className="editor-header">
          <div>
            <p className="eyebrow">Edit {entry.kind}</p>
            <h2>{entry.title}</h2>
          </div>
          <button onClick={onClose}>Close</button>
        </div>

        <form className="editor-form" onSubmit={onSave}>
          <label>
            Type
            <select
              value={draft.kind}
              onChange={(event) =>
                onDraftChange({ ...draft, kind: event.target.value as EntryKind })
              }
            >
              <option value="note">Note</option>
              <option value="reminder">Reminder</option>
            </select>
          </label>
          <label>
            Title
            <input
              value={draft.title}
              onChange={(event) => onDraftChange({ ...draft, title: event.target.value })}
            />
          </label>
          <label>
            Details
            <textarea
              rows={4}
              value={draft.body}
              onChange={(event) => onDraftChange({ ...draft, body: event.target.value })}
            />
          </label>
          <div className="editor-grid">
            <label>
              Time
              <input
                disabled={draft.kind !== "reminder"}
                value={draft.time}
                onChange={(event) => onDraftChange({ ...draft, time: event.target.value })}
              />
            </label>
            <label>
              Tag
              <input
                value={draft.tag}
                onChange={(event) => onDraftChange({ ...draft, tag: event.target.value })}
              />
            </label>
            <label>
              Person
              <input
                value={draft.person}
                onChange={(event) => onDraftChange({ ...draft, person: event.target.value })}
              />
            </label>
            <label>
              Project
              <input
                value={draft.project}
                onChange={(event) => onDraftChange({ ...draft, project: event.target.value })}
              />
            </label>
          </div>
          <div className="editor-actions">
            <button type="button" className="delete-button" onClick={onDelete}>
              Delete
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action: string }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <span>{action}</span>
    </div>
  );
}
