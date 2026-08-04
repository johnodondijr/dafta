import { FormEvent, useMemo, useState } from "react";

type Tab = "Today" | "Inbox" | "Notes" | "Projects" | "Memory";
type EntryKind = "note" | "reminder";

type Entry = {
  id: number;
  kind: EntryKind;
  title: string;
  body: string;
  time?: string;
  tag: string;
  done?: boolean;
};

const seedEntries: Entry[] = [
  {
    id: 1,
    kind: "reminder",
    title: "Send proposal notes to Amina",
    body: "Pulled from yesterday's project note.",
    time: "09:30",
    tag: "Follow-up",
  },
  {
    id: 2,
    kind: "reminder",
    title: "Review UI inspirations",
    body: "Turn references into reusable Dafta components.",
    time: "12:00",
    tag: "Design",
  },
  {
    id: 3,
    kind: "note",
    title: "Dafta product ideas",
    body: "Follow-up engine, smart reminders, daily command center, memory graph.",
    tag: "Product",
  },
  {
    id: 4,
    kind: "note",
    title: "People to check in with",
    body: "Sarah, Amina, Kevin, and the design feedback thread.",
    tag: "People",
  },
];

const tabs: Tab[] = ["Today", "Inbox", "Notes", "Projects", "Memory"];

const datePills = [
  ["Mon", "03"],
  ["Tue", "04"],
  ["Wed", "05"],
  ["Thu", "06"],
  ["Fri", "07"],
  ["Sat", "08"],
];

const projects = [
  {
    name: "Dafta v1",
    summary: "Interactive prototype, GitHub Pages, capture flow.",
    progress: "68%",
  },
  {
    name: "Memory Engine",
    summary: "People, open loops, smart resurfacing.",
    progress: "24%",
  },
];

const people = [
  { name: "Amina", detail: "1 follow-up due today" },
  { name: "Sarah", detail: "Shared UI direction" },
  { name: "Kevin", detail: "Mentioned in planning notes" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("Today");
  const [entries, setEntries] = useState(seedEntries);
  const [draft, setDraft] = useState("");

  const reminders = useMemo(
    () => entries.filter((entry) => entry.kind === "reminder"),
    [entries],
  );

  const notes = useMemo(
    () => entries.filter((entry) => entry.kind === "note"),
    [entries],
  );

  const openLoops = reminders.filter((entry) => !entry.done).length;

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    const reminderMatch = text.match(/\b(remind|call|send|review|buy)\b/i);
    const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);

    const nextEntry: Entry = {
      id: Date.now(),
      kind: reminderMatch ? "reminder" : "note",
      title: text.length > 44 ? `${text.slice(0, 44)}...` : text,
      body: reminderMatch
        ? "Dafta detected this as something to act on."
        : "Captured in Inbox. Ready to organize when you are.",
      time: timeMatch?.[0] ?? (reminderMatch ? "Soon" : undefined),
      tag: reminderMatch ? "Detected" : "Inbox",
    };

    setEntries((current) => [nextEntry, ...current]);
    setDraft("");
    setActiveTab("Inbox");
  }

  function toggleDone(id: number) {
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, done: !entry.done } : entry,
      ),
    );
  }

  return (
    <main className="site-shell">
      <section className="phone-frame" aria-label="Dafta app preview">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span>LTE 100</span>
        </div>

        <header className="topbar">
          <button className="avatar" aria-label="Open profile">
            D
          </button>
          <div>
            <p className="eyebrow">Hello, Sarah</p>
            <h1>{activeTab}</h1>
          </div>
          <button className="icon-button" aria-label="Search Dafta">
            Search
          </button>
        </header>

        {activeTab === "Today" && (
          <>
            <section className="hero-card" aria-label="Today summary">
              <div className="hero-copy">
                <p className="eyebrow">Tuesday, 04 Aug</p>
                <h2>Today asks for 3 things</h2>
                <p>
                  Finish {openLoops} reminders, review one note, and close the
                  loop with Amina.
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
                <span>1 follow-up</span>
                <span>{notes.length} notes</span>
              </div>
            </section>

            <nav className="date-strip" aria-label="Week selector">
              {datePills.map(([day, date]) => (
                <button
                  className={date === "04" ? "date-pill active" : "date-pill"}
                  key={date}
                >
                  <span>{day}</span>
                  <strong>{date}</strong>
                </button>
              ))}
            </nav>

            <CaptureForm draft={draft} setDraft={setDraft} onSubmit={addEntry} />
            <ReminderList reminders={reminders} toggleDone={toggleDone} />
          </>
        )}

        {activeTab === "Inbox" && (
          <section className="screen-stack">
            <CaptureForm draft={draft} setDraft={setDraft} onSubmit={addEntry} />
            <SectionTitle title="Captured" action={`${entries.length} items`} />
            {entries.map((entry) => (
              <EntryCard entry={entry} key={entry.id} toggleDone={toggleDone} />
            ))}
          </section>
        )}

        {activeTab === "Notes" && (
          <section className="screen-stack">
            <SectionTitle title="Notes" action={`${notes.length} notes`} />
            <div className="notes-grid">
              {notes.map((entry) => (
                <article className="note-card" key={entry.id}>
                  <span>{entry.tag}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "Projects" && (
          <section className="screen-stack">
            <SectionTitle title="Projects" action="2 active" />
            {projects.map((project) => (
              <article className="project-card" key={project.name}>
                <span>{project.progress}</span>
                <h3>{project.name}</h3>
                <p>{project.summary}</p>
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
                Dafta is already connecting reminders, notes, people, and
                projects from what you capture.
              </p>
            </section>
            {people.map((person) => (
              <article className="person-row" key={person.name}>
                <span>{person.name.charAt(0)}</span>
                <div>
                  <h3>{person.name}</h3>
                  <p>{person.detail}</p>
                </div>
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
    </main>
  );
}

function CaptureForm({
  draft,
  setDraft,
  onSubmit,
}: {
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="quick-capture" onSubmit={onSubmit}>
      <label>
        <span className="eyebrow">Quick capture</span>
        <input
          aria-label="Quick capture"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Remind me to review notes at 12:00"
          value={draft}
        />
      </label>
      <button>Add</button>
    </form>
  );
}

function ReminderList({
  reminders,
  toggleDone,
}: {
  reminders: Entry[];
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
  toggleDone,
}: {
  entry: Entry;
  tone?: string;
  toggleDone: (id: number) => void;
}) {
  return (
    <article className={`reminder-card ${tone} ${entry.done ? "done" : ""}`}>
      <time>{entry.time ?? entry.tag}</time>
      <div>
        <h3>{entry.title}</h3>
        <p>{entry.body}</p>
      </div>
      {entry.kind === "reminder" && (
        <button onClick={() => toggleDone(entry.id)}>
          {entry.done ? "Undo" : "Done"}
        </button>
      )}
    </article>
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
