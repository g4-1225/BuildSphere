import { useState } from 'react';
import { CalendarClock, Check } from 'lucide-react';

// A small, working slice of the product: ticking tasks updates the progress bar.
const START_TASKS = [
  { id: 1, title: 'Design the login page', who: 'PS', done: true },
  { id: 2, title: 'Build dashboard components', who: 'AR', done: true },
  { id: 3, title: 'Review database schema', who: 'DO', done: false },
  { id: 4, title: 'Prepare the project presentation', who: 'ML', done: false },
];

export default function HeroPreview() {
  const [tasks, setTasks] = useState(START_TASKS);
  const done = tasks.filter((t) => t.done).length;
  const percent = Math.round((done / tasks.length) * 100);

  function toggle(id) {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <div className="hero-preview">
      <div className="browser">
        <div className="browser__bar" aria-hidden="true">
          <span className="browser__dots"><i /><i /><i /></span>
          <span className="browser__url">BuildSphere workspace</span>
        </div>

        <div className="preview">
          <div className="preview__head">
            <div>
              <p className="preview__eyebrow">Final-year project</p>
              <h3 className="preview__title">CampusConnect</h3>
            </div>
            <span className="preview__team" aria-label="Team of four">
              <i className="pv-av pv-av--violet">AR</i>
              <i className="pv-av pv-av--teal">PS</i>
              <i className="pv-av pv-av--amber">DO</i>
              <i className="pv-av pv-av--rose">ML</i>
            </span>
          </div>

          <div className="preview__progress">
            <div className="preview__progress-row">
              <span>Project progress</span>
              <strong>{percent}%</strong>
            </div>
            <div className="pv-bar" role="progressbar" aria-label="Preview project progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>

          <dl className="preview__stats">
            <div><dt>Tasks done</dt><dd>{done}/{tasks.length}</dd></div>
            <div><dt>Teammates</dt><dd>4</dd></div>
            <div><dt>Days left</dt><dd>12</dd></div>
          </dl>

          <ul className="preview__tasks">
            {tasks.map((task) => (
              <li key={task.id}>
                <button type="button" role="checkbox" aria-checked={task.done} className={`pv-task ${task.done ? 'is-done' : ''}`} onClick={() => toggle(task.id)}>
                  <span className="pv-task__box" aria-hidden="true">{task.done && <Check size={12} strokeWidth={3} />}</span>
                  <span className="pv-task__title">{task.title}</span>
                  <span className="pv-task__who" aria-hidden="true">{task.who}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="preview__deadline">
            <CalendarClock size={16} aria-hidden="true" />
            <span><strong>Mid-semester review</strong> in 5 days</span>
          </div>
        </div>
      </div>

      <div className="float-chip float-chip--top" aria-hidden="true">
        <span className="float-chip__dot float-chip__dot--success" />
        {done} of {tasks.length} tasks complete
      </div>
      <p className="hero-preview__hint">Try it: tick a task and watch the progress change.</p>
    </div>
  );
}
