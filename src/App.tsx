import { FormEvent, useEffect, useMemo, useState } from "react";

type Tab = "Today" | "Inbox" | "Notes" | "Calendar" | "Memory";
type EntryKind = "note" | "reminder";
type Priority = "low" | "medium" | "high";

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
  date?: string;
  priority?: Priority;
};

type EntryDraft = {
  kind: EntryKind;
  body: string;
  time: string;
  tag: string;
  date: string;
  priority: Priority;
};

const storageKey = "dafta.entries.v2";
const defaultDate = "2026-08-04";
const tabs: Tab[] = ["Today", "Inbox", "Notes", "Calendar", "Memory"];
const selectedMonthLabel = "August 2026";

const seedEntries: Entry[] = [
  {
    id: 1,
    kind: "reminder",
    title: "Send proposal notes",
    body: "Attach the latest product notes and send before lunch.",
    time: "09:30",
    tag: "Follow-up",
    date: "2026-08-04",
    priority: "high",
    createdAt: "2026-08-04T09:00:00.000Z",
    updatedAt: "2026-08-04T09:00:00.000Z",
  },
  {
    id: 2,
    kind: "reminder",
    title: "Review UI inspirations",
    body: "Convert the visual direction into reusable Dafta components.",
    time: "12:00",
    tag: "Design",
    date: "2026-08-04",
    priority: "medium",
    createdAt: "2026-08-04T10:00:00.000Z",
    updatedAt: "2026-08-04T10:00:00.000Z",
  },
  {
    id: 3,
    kind: "note",
    title: "Dafta product ideas",
    body: "Smart reminders, calm calendar, daily command center, and quick notes.",
    tag: "Product",
    date: "2026-08-04",
    priority: "medium",
    createdAt: "2026-08-04T11:00:00.000Z",
    updatedAt: "2026-08-04T11:00:00.000Z",
  },
  {
    id: 4,
    kind: "note",
    title: "Inbox purpose",
    body: "Inbox is the unsorted capture space. Save quickly, decide later.",
    tag: "Inbox",
    date: "2026-08-05",
    priority: "low",
    createdAt: "2026-08-04T12:00:00.000Z",
    updatedAt: "2026-08-04T12:00:00.000Z",
  },
];

const monthDays = Array.from({ length: 31 }, (_, index) => {
  const date = new Date("2026-08-01T00:00:00");
  date.setDate(index + 1);

  return {
    day: date.toLocaleDateString("en-US", { weekday: "short" }),
    label: String(index + 1).padStart(2, "0"),
    key: toDateKey(date),
  };
});

function loadEntries() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as Entry[]) : seedEntries;
  } catch {
    return seedEntries;
  }
}

function makeEmptyDraft(kind: EntryKind = "note", date = defaultDate): EntryDraft {
  return {
    kind,
    body: "",
    time: "",
    tag: kind === "reminder" ? "Reminder" : "Note",
    date,
    priority: "medium",
  };
}

function parseCapture(text: string, fallback: EntryDraft) {
  const reminderMatch = text.match(/\b(remind|call|send|review|buy|pay|email)\b/i);
  const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const tagMatch = text.match(/#([a-z0-9-]+)/i);
  const normalizedTitle = text.replace(/#([a-z0-9-]+)/gi, "").trim();
  const inferredKind = reminderMatch ? "reminder" : fallback.kind;
  const kind: EntryKind =
    fallback.kind === "reminder" || inferredKind === "reminder"
      ? "reminder"
      : "note";

  return {
    kind,
    title:
      normalizedTitle.length > 56
        ? `${normalizedTitle.slice(0, 56)}...`
        : normalizedTitle,
    body:
      fallback.body.trim() ||
      (kind === "reminder"
        ? "Captured as a reminder."
        : "Captured as a note."),
    time: kind === "reminder" ? fallback.time.trim() || timeMatch?.[0] || "Soon" : undefined,
    tag: fallback.tag.trim() || tagMatch?.[1] || (kind === "reminder" ? "Reminder" : "Note"),
    date: fallback.date,
    priority: text.match(/\b(urgent|important|asap|today)\b/i)
      ? "high"
      : fallback.priority,
  };
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
  const [captureDraft, setCaptureDraft] = useState<EntryDraft>(() =>
    makeEmptyDraft("note", defaultDate),
  );
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(defaultDate);
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
      [entry.title, entry.body, entry.tag]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [entries, query]);

  const notes = filteredEntries.filter((entry) => entry.kind === "note");
  const allNotes = entries.filter((entry) => entry.kind === "note");
  const allReminders = entries.filter((entry) => entry.kind === "reminder");
  const selectedDateEntries = filteredEntries.filter(
    (entry) => (entry.date ?? defaultDate) === selectedDate,
  );
  const selectedDateReminders = selectedDateEntries.filter(
    (entry) => entry.kind === "reminder",
  );
  const openLoops = allReminders.filter((entry) => !entry.done).length;
  const nextReminder =
    selectedDateReminders.find((entry) => !entry.done) ??
    allReminders.find((entry) => !entry.done);
  const upcomingReminders = allReminders
    .filter((entry) => !entry.done && (entry.date ?? defaultDate) > selectedDate)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 3);
  const completedCount = allReminders.filter((entry) => entry.done).length;
  const recentNotes = allNotes.slice(0, 3);

  function addEntry(event: FormEvent<HTMLFormElement>, forcedKind?: EntryKind) {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    const nextDraft = forcedKind
      ? { ...captureDraft, kind: forcedKind, tag: forcedKind === "note" ? "Note" : captureDraft.tag }
      : captureDraft;
    const parsed = parseCapture(text, nextDraft);
    const now = new Date().toISOString();
    const nextEntry: Entry = {
      id: Date.now(),
      ...parsed,
      createdAt: now,
      updatedAt: now,
    };

    setEntries((current) => [nextEntry, ...current]);
    setDraft("");
    setCaptureDraft(makeEmptyDraft(nextDraft.kind, selectedDate));
    setCaptureDetailsOpen(false);
    setSelectedEntry(nextEntry);
    setEditorDraft(entryToDraft(nextEntry));
    setActiveTab(forcedKind === "note" ? "Notes" : "Inbox");
  }

  function openEditor(entry: Entry) {
    setSelectedEntry(entry);
    setEditorDraft(entryToDraft(entry));
  }

  function saveSelectedEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEntry || !selectedEntry.title.trim()) {
      return;
    }

    const updatedEntry: Entry = {
      ...selectedEntry,
      kind: editorDraft.kind,
      body: editorDraft.body.trim(),
      time: editorDraft.kind === "reminder" ? editorDraft.time.trim() || "Soon" : undefined,
      tag: editorDraft.tag.trim() || (editorDraft.kind === "reminder" ? "Reminder" : "Note"),
      priority: editorDraft.priority,
      updatedAt: new Date().toISOString(),
      date: editorDraft.date || selectedEntry.date || selectedDate,
    };

    setEntries((current) =>
      current.map((entry) => (entry.id === selectedEntry.id ? updatedEntry : entry)),
    );
    setSelectedEntry(updatedEntry);
  }

  function updateSelectedTitle(title: string) {
    if (!selectedEntry) {
      return;
    }

    setSelectedEntry({ ...selectedEntry, title });
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

  function snoozeReminder(id: number) {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== id || entry.kind !== "reminder") {
          return entry;
        }

        const currentDate = new Date(`${entry.date ?? selectedDate}T00:00:00`);
        currentDate.setDate(Math.min(currentDate.getDate() + 1, 31));

        return {
          ...entry,
          date: toDateKey(currentDate),
          done: false,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  function resetData() {
    setEntries(seedEntries);
    setSelectedEntry(null);
    setQuery("");
    setSelectedDate(defaultDate);
    setCaptureDraft(makeEmptyDraft("note", defaultDate));
  }

  function openCalendarForDate(dateKey: string) {
    setSelectedDate(dateKey);
    setActiveTab("Calendar");
  }

  return (
    <main className="site-shell">
      <section className="phone-frame" aria-label="Dafta app preview">
        <div className="app-scroll">
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
              placeholder="Search notes, reminders, tags..."
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
                <div className="hero-metrics">
                  <span>{openLoops} due</span>
                  <span>{completedCount} done</span>
                  <span>{allNotes.length} notes</span>
                </div>
              </section>

              <DateStrip selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
              <button className="calendar-link" onClick={() => setActiveTab("Calendar")}>
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
                onSubmit={(event) => addEntry(event)}
              />
              <ReminderList
                reminders={selectedDateReminders}
                openEditor={openEditor}
                snoozeReminder={snoozeReminder}
                toggleDone={toggleDone}
              />
              {upcomingReminders.length > 0 && (
                <ReminderList
                  reminders={upcomingReminders}
                  title="Upcoming"
                  openEditor={openEditor}
                  snoozeReminder={snoozeReminder}
                  toggleDone={toggleDone}
                />
              )}
            </>
          )}

          {activeTab === "Inbox" && (
            <section className="screen-stack">
              <section className="inbox-note">
                <h2>What is Inbox?</h2>
                <p>
                  Inbox is Dafta's quick holding area. Capture first, clean up
                  later.
                </p>
              </section>
              <CaptureForm
                captureDetailsOpen={captureDetailsOpen}
                draft={draft}
                entryDraft={captureDraft}
                selectedDate={selectedDate}
                setCaptureDetailsOpen={setCaptureDetailsOpen}
                setDraft={setDraft}
                setEntryDraft={setCaptureDraft}
                onSubmit={(event) => addEntry(event)}
              />
              <SectionTitle title="Captured" action={`${filteredEntries.length} items`} />
              {filteredEntries.map((entry, index) => (
                <EntryCard
                  entry={entry}
                  key={entry.id}
                  openEditor={openEditor}
                  snoozeReminder={snoozeReminder}
                  tone={["yellow", "blue", "violet"][index % 3]}
                  toggleDone={toggleDone}
                />
              ))}
            </section>
          )}

          {activeTab === "Notes" && (
            <section className="screen-stack">
              <CaptureForm
                captureDetailsOpen={captureDetailsOpen}
                draft={draft}
                entryDraft={{ ...captureDraft, kind: "note", tag: "Note" }}
                selectedDate={selectedDate}
                setCaptureDetailsOpen={setCaptureDetailsOpen}
                setDraft={setDraft}
                setEntryDraft={setCaptureDraft}
                submitLabel="Add note"
                placeholder="Write a quick note, idea, link, or thought"
                showType={false}
                onSubmit={(event) => addEntry(event, "note")}
              />
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

              <SectionTitle title="This day" action={`${selectedDateEntries.length} items`} />
              <CaptureForm
                captureDetailsOpen={captureDetailsOpen}
                draft={draft}
                entryDraft={{ ...captureDraft, date: selectedDate }}
                selectedDate={selectedDate}
                setCaptureDetailsOpen={setCaptureDetailsOpen}
                setDraft={setDraft}
                setEntryDraft={setCaptureDraft}
                onSubmit={(event) => addEntry(event)}
              />
              {selectedDateEntries.map((entry, index) => (
                <EntryCard
                  entry={entry}
                  key={entry.id}
                  openEditor={openEditor}
                  snoozeReminder={snoozeReminder}
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

          {activeTab === "Memory" && (
            <section className="screen-stack">
              <section className="memory-card">
                <p className="eyebrow">Memory</p>
                <h2>Your recent notes</h2>
                <p>
                  A simple review space for saved notes and unfinished reminders.
                </p>
              </section>
              <SectionTitle title="Review" action={`${openLoops} open loops`} />
              {recentNotes.map((entry) => (
                <button
                  className="note-card review-card"
                  key={entry.id}
                  onClick={() => openEditor(entry)}
                >
                  <span>{entry.tag}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.body}</p>
                </button>
              ))}
            </section>
          )}
        </div>

        <nav className="bottom-nav" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab ? "active" : ""}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              <span>{tab}</span>
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
          onTitleChange={updateSelectedTitle}
        />
      )}
    </main>
  );
}

function entryToDraft(entry: Entry): EntryDraft {
  return {
    kind: entry.kind,
    body: entry.body,
    time: entry.time ?? "",
    tag: entry.tag,
    date: entry.date ?? defaultDate,
    priority: entry.priority ?? "medium",
  };
}

function DateStrip({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  return (
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
  );
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
  placeholder = "Remind me to review notes at 12:00 #design",
  showType = true,
  submitLabel = "Add",
}: {
  captureDetailsOpen: boolean;
  draft: string;
  entryDraft: EntryDraft;
  selectedDate: string;
  setCaptureDetailsOpen: (value: boolean) => void;
  setDraft: (value: string) => void;
  setEntryDraft: (draft: EntryDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  showType?: boolean;
  submitLabel?: string;
}) {
  return (
    <form className="quick-capture" onSubmit={onSubmit}>
      <label>
        <span className="eyebrow">Quick capture for {formatDateLabel(selectedDate)}</span>
        <input
          aria-label="Quick capture"
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          value={draft}
        />
      </label>
      <button>{submitLabel}</button>
      <button
        className="details-toggle"
        type="button"
        onClick={() => setCaptureDetailsOpen(!captureDetailsOpen)}
      >
        {captureDetailsOpen ? "Hide details" : "Add details"}
      </button>
      {captureDetailsOpen && (
        <div className="capture-details">
          {showType && (
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
          )}
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
            Tag
            <input
              placeholder="Follow-up"
              value={entryDraft.tag}
              onChange={(event) =>
                setEntryDraft({ ...entryDraft, tag: event.target.value })
              }
            />
          </label>
          <label>
            Priority
            <select
              value={entryDraft.priority}
              onChange={(event) =>
                setEntryDraft({
                  ...entryDraft,
                  priority: event.target.value as Priority,
                })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
  snoozeReminder,
  toggleDone,
  title = "Reminders",
}: {
  reminders: Entry[];
  openEditor: (entry: Entry) => void;
  snoozeReminder: (id: number) => void;
  toggleDone: (id: number) => void;
  title?: string;
}) {
  return (
    <section className="content-section">
      <SectionTitle title={title} action={`${reminders.length} total`} />
      <div className="reminder-list">
        {reminders.map((entry, index) => (
          <EntryCard
            entry={entry}
            key={entry.id}
            openEditor={openEditor}
            snoozeReminder={snoozeReminder}
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
  snoozeReminder,
  toggleDone,
}: {
  entry: Entry;
  tone?: string;
  openEditor: (entry: Entry) => void;
  snoozeReminder: (id: number) => void;
  toggleDone: (id: number) => void;
}) {
  return (
    <article className={`reminder-card ${tone} ${entry.done ? "done" : ""}`}>
      <button className="entry-time" onClick={() => openEditor(entry)}>
        {entry.time ?? entry.tag}
      </button>
      <button className="entry-body" onClick={() => openEditor(entry)}>
        <span className={`priority-chip ${entry.priority ?? "medium"}`}>
          {entry.priority ?? "medium"}
        </span>
        <h3>{entry.title}</h3>
        <p>
          {entry.body} {entry.date ? `· ${formatDateLabel(entry.date)}` : ""}
        </p>
      </button>
      {entry.kind === "reminder" && (
        <div className="entry-actions">
          <button onClick={() => snoozeReminder(entry.id)}>Snooze</button>
          <button onClick={() => toggleDone(entry.id)}>
            {entry.done ? "Undo" : "Done"}
          </button>
        </div>
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
  onTitleChange,
}: {
  draft: EntryDraft;
  entry: Entry;
  onClose: () => void;
  onDelete: () => void;
  onDraftChange: (draft: EntryDraft) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (title: string) => void;
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
            <input value={entry.title} onChange={(event) => onTitleChange(event.target.value)} />
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
              Date
              <select
                value={draft.date}
                onChange={(event) => onDraftChange({ ...draft, date: event.target.value })}
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
                disabled={draft.kind !== "reminder"}
                value={draft.time}
                onChange={(event) => onDraftChange({ ...draft, time: event.target.value })}
              />
            </label>
            <label>
              Priority
              <select
                value={draft.priority}
                onChange={(event) =>
                  onDraftChange({ ...draft, priority: event.target.value as Priority })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label>
              Tag
              <input
                value={draft.tag}
                onChange={(event) => onDraftChange({ ...draft, tag: event.target.value })}
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
