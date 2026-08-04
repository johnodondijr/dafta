import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dafta - Notes that remember with you",
  description:
    "A premium notes and reminders app for capturing thoughts, remembering commitments, and planning the day.",
};

const dates = [
  { day: "Mon", date: "03" },
  { day: "Tue", date: "04", active: true },
  { day: "Wed", date: "05" },
  { day: "Thu", date: "06" },
  { day: "Fri", date: "07" },
  { day: "Sat", date: "08" },
];

const reminders = [
  {
    time: "09:30",
    title: "Send proposal notes to Amina",
    context: "From yesterday's project entry",
    tone: "yellow",
  },
  {
    time: "12:00",
    title: "Review UI inspirations",
    context: "Dafta product design",
    tone: "blue",
  },
  {
    time: "18:30",
    title: "Buy groceries on the way home",
    context: "Location reminder suggested",
    tone: "violet",
  },
];

const notes = [
  {
    title: "Dafta product ideas",
    preview: "Follow-up engine, smart reminders, daily command center...",
    meta: "12 linked actions",
  },
  {
    title: "People to check in with",
    preview: "Sarah, Amina, Kevin, and the design feedback thread.",
    meta: "4 open loops",
  },
];

const navItems = ["Today", "Inbox", "Notes", "Projects", "Memory"];

export default function Home() {
  return (
    <main className="site-shell">
      <section className="phone-frame" aria-label="Dafta mobile app preview">
        <div className="status-bar" aria-hidden="true">
          <span>9:41</span>
          <span className="status-dots">LTE 100</span>
        </div>

        <header className="topbar">
          <div className="profile-chip">
            <div className="avatar" aria-hidden="true">
              D
            </div>
            <div>
              <p className="eyebrow">Hello, Sarah</p>
              <h1>Today</h1>
            </div>
          </div>
          <button className="icon-button" aria-label="Search Dafta">
            <span aria-hidden="true">Q</span>
          </button>
        </header>

        <section className="hero-card" aria-label="Today summary">
          <div className="hero-copy">
            <p className="eyebrow">Tuesday, 04 Aug</p>
            <h2>Today asks for 3 things</h2>
            <p>
              Finish two reminders, review one note, and close the loop with
              Amina.
            </p>
          </div>
          <div className="memory-orbit" aria-hidden="true">
            <span className="orb orb-one" />
            <span className="orb orb-two" />
            <span className="orb orb-three" />
            <span className="orb orb-four" />
          </div>
          <div className="hero-metrics">
            <span>2 due</span>
            <span>1 follow-up</span>
            <span>3 notes</span>
          </div>
        </section>

        <nav className="date-strip" aria-label="Week selector">
          {dates.map((item) => (
            <button
              className={item.active ? "date-pill active" : "date-pill"}
              key={`${item.day}-${item.date}`}
            >
              <span>{item.day}</span>
              <strong>{item.date}</strong>
            </button>
          ))}
        </nav>

        <section className="quick-capture" aria-label="Quick capture">
          <div>
            <p className="eyebrow">Quick capture</p>
            <h2>Drop a thought here</h2>
          </div>
          <button>New entry</button>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <h2>Reminders</h2>
            <a href="#notes">View notes</a>
          </div>
          <div className="reminder-list">
            {reminders.map((reminder) => (
              <article
                className={`reminder-card ${reminder.tone}`}
                key={reminder.title}
              >
                <time>{reminder.time}</time>
                <div>
                  <h3>{reminder.title}</h3>
                  <p>{reminder.context}</p>
                </div>
                <button aria-label={`Complete ${reminder.title}`}>Done</button>
              </article>
            ))}
          </div>
        </section>

        <section className="notes-grid" id="notes" aria-label="Recent notes">
          {notes.map((note) => (
            <article className="note-card" key={note.title}>
              <span>{note.meta}</span>
              <h3>{note.title}</h3>
              <p>{note.preview}</p>
            </article>
          ))}
        </section>

        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button className={item === "Today" ? "active" : ""} key={item}>
              <span aria-hidden="true">{item.charAt(0)}</span>
              <strong>{item}</strong>
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
