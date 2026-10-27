import { useMemo, useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import TaskItem from './TaskItem';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { countTasksByStatus, PRIORITY, sortTasks } from '../../utils/projectUtils';

const TABS = [
  { id: 'all', label: 'All Tasks' },
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

/** Task list with status tabs, a priority filter and sorting. */
export default function TaskList({ tasks, ui, limit, idPrefix = 'tasks', hideProject = false, defaultProjectId }) {
  const [tab, setTab] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sortBy, setSortBy] = useState('due');

  const byPriority = useMemo(
    () => (priority === 'all' ? tasks : tasks.filter((t) => t.priority === priority)),
    [tasks, priority]
  );
  const counts = countTasksByStatus(byPriority);
  const visible = sortTasks(tab === 'all' ? byPriority : byPriority.filter((t) => t.status === tab), sortBy);
  const shown = limit ? visible.slice(0, limit) : visible;

  function handleTabKey(event, index) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    setTab(TABS[next].id);
    document.getElementById(`${idPrefix}-tab-${TABS[next].id}`)?.focus();
  }

  return (
    <div className="task-list">
      <div className="task-toolbar">
        <div className="tabs" role="tablist" aria-label="Filter tasks by status">
          {TABS.map((item, index) => (
            <button
              key={item.id}
              id={`${idPrefix}-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`${idPrefix}-panel`}
              tabIndex={tab === item.id ? 0 : -1}
              className={`tab ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => setTab(item.id)}
              onKeyDown={(e) => handleTabKey(e, index)}
            >
              {item.label}
              <span className="tab__count">{item.id === 'all' ? byPriority.length : counts[item.id]}</span>
            </button>
          ))}
        </div>
        <div className="task-toolbar__filters">
          <label className="select-inline">
            <span className="sr-only">Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="all">Any priority</option>
              {Object.entries(PRIORITY).map(([value, label]) => <option key={value} value={value}>{label} priority</option>)}
            </select>
          </label>
          <label className="select-inline">
            <span className="sr-only">Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="due">Sort: due date</option>
              <option value="priority">Sort: priority</option>
              <option value="newest">Sort: newest</option>
            </select>
          </label>
        </div>
      </div>

      <div id={`${idPrefix}-panel`} role="tabpanel" aria-labelledby={`${idPrefix}-tab-${tab}`}>
        {shown.length > 0 ? (
          <ul className="task-items">
            {shown.map((task) => <TaskItem key={task.id} task={task} ui={ui} hideProject={hideProject} />)}
          </ul>
        ) : (
          <EmptyState
            compact
            icon={ListChecks}
            title={tasks.length === 0 ? 'No tasks to display' : 'No tasks match these filters'}
            text={tasks.length === 0 ? 'Break the work into small steps your team can tick off.' : 'Try another tab or priority.'}
            action={
              tasks.length === 0 && (
                <Button size="sm" onClick={() => ui.openNewTask({ projectId: defaultProjectId })}>
                  <Plus size={16} aria-hidden="true" /> New task
                </Button>
              )
            }
          />
        )}
        {limit && visible.length > limit && (
          <p className="task-list__more muted small">Showing {limit} of {visible.length} tasks.</p>
        )}
      </div>
    </div>
  );
}
