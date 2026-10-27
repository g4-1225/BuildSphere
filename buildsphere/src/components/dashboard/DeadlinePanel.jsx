import { CalendarCheck, Flag } from 'lucide-react';
import Panel from '../common/Panel';
import EmptyState from '../common/EmptyState';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getUpcomingDeadlines, PRIORITY } from '../../utils/projectUtils';
import { deadlineTone, parseDate, relativeDeadline } from '../../utils/dateUtils';

export default function DeadlinePanel({ ui, limit = 6 }) {
  const { projects, tasks } = useWorkspace();
  const items = getUpcomingDeadlines(projects, tasks, 21).slice(0, limit);

  function openItem(item) {
    if (item.kind === 'project') ui.openProject(item.refId);
    else ui.openEditTask(tasks.find((t) => t.id === item.refId));
  }

  return (
    <Panel title="Upcoming Deadlines" subtitle="Open work due in the next 3 weeks" className="deadline-panel">
      {items.length === 0 ? (
        <EmptyState compact icon={CalendarCheck} title="Nothing due soon" text="No open tasks or submissions in the next three weeks." />
      ) : (
        <ul className="deadlines">
          {items.map((item) => {
            const date = parseDate(item.dueDate);
            const tone = deadlineTone(item.dueDate);
            return (
              <li key={item.id}>
                <button type="button" className={`deadline deadline--${tone}`} onClick={() => openItem(item)}>
                  <span className="deadline__date" aria-hidden="true">
                    <span>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <strong>{date.getDate()}</strong>
                  </span>
                  <span className="deadline__body">
                    <span className="deadline__title">{item.title}</span>
                    <span className="deadline__project">
                      {item.projectName}
                      <span className={`priority-dot priority-dot--${item.priority}`}>
                        <Flag size={11} aria-hidden="true" /> {PRIORITY[item.priority]}
                      </span>
                    </span>
                  </span>
                  <span className={`deadline__when deadline__when--${tone}`}>{relativeDeadline(item.dueDate)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
