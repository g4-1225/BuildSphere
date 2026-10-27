import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CalendarCheck, ChevronLeft, ChevronRight, CircleCheck, Flag, ListChecks, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { PriorityBadge, ProjectStatusBadge, TaskStatusBadge } from '../components/common/Badge';
import PageHeader from './PageHeader';
import { useWorkspace } from '../context/WorkspaceContext';
import { shortName } from '../utils/projectUtils';
import { addDays, formatDateLong, parseDate, relativeDeadline, startOfToday, toISODate } from '../utils/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 6 rows × 7 days covering the month, starting on Sunday. */
function buildMonthGrid(monthStart) {
  const first = addDays(monthStart, -monthStart.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

export default function CalendarPage() {
  const ui = useOutletContext();
  const { projects, tasks } = useWorkspace();
  const today = startOfToday();
  const todayISO = toISODate(today);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(todayISO);
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Every task due date and project submission becomes a calendar event.
  const events = useMemo(() => {
    const list = [
      ...projects.map((p) => ({
        id: `project-${p.id}`, kind: 'project', refId: p.id, date: p.dueDate,
        title: `${shortName(p.name)} submission`, projectName: shortName(p.name), done: p.status === 'completed',
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`, kind: 'task', refId: t.id, date: t.dueDate, title: t.title,
        projectName: shortName(projects.find((p) => p.id === t.projectId)?.name || ''), done: t.status === 'completed',
      })),
    ];
    return list.reduce((map, event) => {
      (map[event.date] ||= []).push(event);
      return map;
    }, {});
  }, [projects, tasks]);

  const days = buildMonthGrid(month);
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayEvents = events[selectedDay] || [];
  const selectedEvent = Object.values(events).flat().find((e) => e.id === selectedEventId);
  const monthCount = days.filter((d) => d.getMonth() === month.getMonth()).reduce((n, d) => n + (events[toISODate(d)]?.length || 0), 0);

  function changeMonth(offset) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));
  }

  function goToToday() {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDay(todayISO);
  }

  function selectEvent(event) {
    setSelectedDay(event.date);
    setSelectedEventId(event.id);
  }

  return (
    <div className="page">
      <PageHeader title="Calendar" text="Task due dates and project submissions, month by month." />

      <div className="calendar-layout">
        <section className="panel calendar" aria-labelledby="calendar-month">
          <header className="calendar__header">
            <div>
              <h3 id="calendar-month" className="calendar__month" aria-live="polite">{monthLabel}</h3>
              <p className="muted small">{monthCount} deadline{monthCount === 1 ? '' : 's'} this month</p>
            </div>
            <div className="calendar__nav">
              <Button variant="secondary" size="sm" onClick={goToToday}>Today</Button>
              <button type="button" className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Previous month"><ChevronLeft size={18} aria-hidden="true" /></button>
              <button type="button" className="icon-btn" onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={18} aria-hidden="true" /></button>
            </div>
          </header>

          <div className="calendar__legend" aria-hidden="true">
            <span><Flag size={12} /> Project submission</span>
            <span><ListChecks size={12} /> Task due</span>
            <span><CircleCheck size={12} /> Done</span>
          </div>

          <div className="calendar__grid" role="grid" aria-labelledby="calendar-month">
            <div className="calendar__row" role="row">
              {WEEKDAYS.map((d) => <div key={d} role="columnheader" className="calendar__weekday">{d}</div>)}
            </div>
            {Array.from({ length: 6 }, (_, week) => (
              <div className="calendar__row" role="row" key={week}>
                {days.slice(week * 7, week * 7 + 7).map((date) => {
                  const iso = toISODate(date);
                  const list = events[iso] || [];
                  const outside = date.getMonth() !== month.getMonth();
                  const classes = ['calendar__day', outside && 'is-outside', iso === todayISO && 'is-today', iso === selectedDay && 'is-selected'].filter(Boolean).join(' ');
                  return (
                    <div key={iso} role="gridcell" className={classes} aria-selected={iso === selectedDay}>
                      <button
                        type="button"
                        className="calendar__date"
                        onClick={() => { setSelectedDay(iso); setSelectedEventId(null); }}
                        aria-label={`${formatDateLong(iso)}, ${list.length} deadline${list.length === 1 ? '' : 's'}`}
                      >
                        {date.getDate()}
                      </button>
                      <div className="calendar__events">
                        {list.slice(0, 2).map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            className={`cal-event cal-event--${event.kind} ${event.done ? 'is-done' : ''}`}
                            onClick={() => selectEvent(event)}
                            title={event.title}
                          >
                            {event.kind === 'project' ? <Flag size={11} aria-hidden="true" /> : event.done ? <CircleCheck size={11} aria-hidden="true" /> : <ListChecks size={11} aria-hidden="true" />}
                            <span>{event.title}</span>
                          </button>
                        ))}
                        {list.length > 2 && (
                          <button type="button" className="cal-more" onClick={() => { setSelectedDay(iso); setSelectedEventId(null); }}>
                            +{list.length - 2} more
                          </button>
                        )}
                      </div>
                      {list.length > 0 && <span className="calendar__dots" aria-hidden="true">{list.slice(0, 3).map((e) => <i key={e.id} className={`dot dot--${e.kind}`} />)}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className="panel calendar-side" aria-label="Selected day">
          <h3 className="panel__title">{formatDateLong(selectedDay)}</h3>
          <p className="muted small">{selectedDay === todayISO ? 'Today' : relativeDeadline(selectedDay).replace('Due ', '').replace('Overdue by', 'Passed')}</p>

          {Object.keys(events).length === 0 ? (
            <EmptyState
              compact
              icon={CalendarCheck}
              title="Your calendar is clear"
              text="Task due dates and project submissions will show up here."
              action={<Button size="sm" onClick={ui.openNewProject}><Plus size={16} aria-hidden="true" /> Create Project</Button>}
            />
          ) : selectedEvent ? (
            <EventDetails event={selectedEvent} ui={ui} onBack={() => setSelectedEventId(null)} />
          ) : dayEvents.length === 0 ? (
            <EmptyState compact icon={ListChecks} title="Nothing due this day" text="Pick a highlighted date to see what’s due." />
          ) : (
            <ul className="day-list">
              {dayEvents.map((event) => (
                <li key={event.id}>
                  <button type="button" className={`day-item day-item--${event.kind}`} onClick={() => setSelectedEventId(event.id)}>
                    {event.kind === 'project' ? <Flag size={15} aria-hidden="true" /> : <ListChecks size={15} aria-hidden="true" />}
                    <span>
                      <strong className={event.done ? 'is-struck' : ''}>{event.title}</strong>
                      <span className="muted small">{event.kind === 'project' ? 'Project submission' : event.projectName}{event.done ? ', done' : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

function EventDetails({ event, ui, onBack }) {
  const { getProject, tasks, getMember } = useWorkspace();
  const task = event.kind === 'task' ? tasks.find((t) => t.id === event.refId) : null;
  const project = getProject(task ? task.projectId : event.refId);
  if (!task && !project) return null;
  const assignee = task && getMember(task.assignedTo);
  const date = parseDate(event.date);

  return (
    <div className="event-details">
      <button type="button" className="link-btn" onClick={onBack}><ChevronLeft size={14} aria-hidden="true" /> All items on this day</button>
      <p className="event-details__kind">{task ? 'Task' : 'Project submission'}</p>
      <h4>{task ? task.title : project.name}</h4>
      <div className="event-details__badges">
        {task ? <><TaskStatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></> : <ProjectStatusBadge status={project.status} />}
      </div>
      {(task?.description || (!task && project.description)) && <p className="event-details__desc">{task ? task.description : project.description}</p>}
      <dl className="event-details__meta">
        <div><dt>Due</dt><dd>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</dd></div>
        {project && <div><dt>Project</dt><dd>{shortName(project.name)}</dd></div>}
        {task && <div><dt>Assigned to</dt><dd>{assignee ? assignee.name : 'Unassigned'}</dd></div>}
      </dl>
      <div className="event-details__actions">
        {task && <Button size="sm" onClick={() => ui.openEditTask(task)}>Edit task</Button>}
        {project && <Button size="sm" variant="secondary" onClick={() => ui.openProject(project.id)}>Open project</Button>}
      </div>
    </div>
  );
}
