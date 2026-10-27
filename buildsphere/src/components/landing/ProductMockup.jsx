import { CalendarDays, FolderKanban, LayoutDashboard, ListChecks, Paperclip, Users } from 'lucide-react';

// Static, decorative overview of the dashboard used in the "product preview" section.
const NAV = [LayoutDashboard, FolderKanban, ListChecks, Users, Paperclip, CalendarDays];

const PROJECTS = [
  { name: 'BuildSphere', tag: 'Web Development', pct: 50, state: 'In Progress' },
  { name: 'CampusConnect', tag: 'Mobile App', pct: 25, state: 'In Progress' },
  { name: 'EcoTrack', tag: 'Data Science', pct: 50, state: 'On Hold' },
];

const DEADLINES = [
  { d: 'Tomorrow', t: 'Review database schema', p: 'CampusConnect' },
  { d: 'In 2 days', t: 'Build dashboard components', p: 'BuildSphere' },
  { d: 'In 6 days', t: 'Complete documentation', p: 'BuildSphere' },
];

const ACTIVITY = [
  { who: 'PS', c: 'teal', t: 'Priya completed Set up routing' },
  { who: 'DO', c: 'amber', t: 'Daniel started Review schema' },
  { who: 'ML', c: 'rose', t: 'Mei moved a deadline' },
];

export default function ProductMockup() {
  return (
    <div className="mockup" role="img" aria-label="BuildSphere dashboard showing project progress, task completion, upcoming deadlines and team activity">
      <div className="mockup__sidebar" aria-hidden="true">
        <span className="mockup__logo" />
        {NAV.map((Icon, i) => (
          <span key={i} className={`mockup__nav ${i === 0 ? 'is-active' : ''}`}><Icon size={16} /></span>
        ))}
      </div>
      <div className="mockup__main" aria-hidden="true">
        <div className="mockup__top">
          <div>
            <p className="mockup__hello">Good morning, Alex!</p>
            <p className="mockup__sub">3 tasks due this week</p>
          </div>
          <span className="mockup__btn">+ New Project</span>
        </div>

        <div className="mockup__stats">
          {[['Active projects', '02'], ['Tasks completed', '09 / 14'], ['Pending tasks', '05'], ['Upcoming deadlines', '04']].map(([label, value]) => (
            <div key={label} className="mockup__stat">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="mockup__grid">
          <div className="mockup__card mockup__card--projects">
            <p className="mockup__card-title">Project overview</p>
            {PROJECTS.map((p) => (
              <div key={p.name} className="mockup__project">
                <div className="mockup__project-row">
                  <strong>{p.name}</strong>
                  <span className={`mockup__pill ${p.state === 'On Hold' ? 'is-hold' : ''}`}>{p.state}</span>
                </div>
                <span className="mockup__muted">{p.tag}</span>
                <div className="mockup__bar"><span style={{ width: `${p.pct}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="mockup__card mockup__card--completion">
            <p className="mockup__card-title">Task completion</p>
            <div className="mockup__ring" style={{ '--pct': 64 }}>
              <span><strong>64%</strong>done</span>
            </div>
            <div className="mockup__legend">
              <span><i className="lg lg--done" />9 done</span>
              <span><i className="lg lg--prog" />2 in progress</span>
              <span><i className="lg lg--todo" />3 to do</span>
            </div>
          </div>

          <div className="mockup__card">
            <p className="mockup__card-title">Upcoming deadlines</p>
            {DEADLINES.map((d) => (
              <div key={d.t} className="mockup__deadline">
                <span className={`mockup__when ${d.d === 'Tomorrow' ? 'is-soon' : ''}`}>{d.d}</span>
                <div><strong>{d.t}</strong><span className="mockup__muted">{d.p}</span></div>
              </div>
            ))}
          </div>

          <div className="mockup__card">
            <p className="mockup__card-title">Team activity</p>
            {ACTIVITY.map((a) => (
              <div key={a.t} className="mockup__activity">
                <i className={`pv-av pv-av--${a.c}`}>{a.who}</i>
                <span>{a.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
