import { Clock, Folder, Pencil, Trash2 } from 'lucide-react';
import { PriorityBadge, TaskStatusBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import ActionMenu from '../common/ActionMenu';
import { useWorkspace } from '../../context/WorkspaceContext';
import { shortName } from '../../utils/projectUtils';
import { deadlineTone, formatDate, formatDateLong, relativeDeadline } from '../../utils/dateUtils';

export default function TaskItem({ task, ui, hideProject = false }) {
  const { toggleTask, getProject, getMember } = useWorkspace();
  const project = getProject(task.projectId);
  const assignee = getMember(task.assignedTo);
  const isDone = task.status === 'completed';
  const tone = deadlineTone(task.dueDate, isDone);
  const checkboxId = `task-check-${task.id}`;

  return (
    <li className={`task-item ${isDone ? 'is-done' : ''}`}>
      <input
        id={checkboxId}
        type="checkbox"
        className="checkbox checkbox--round"
        checked={isDone}
        onChange={() => toggleTask(task.id)}
        aria-label={isDone ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
      />
      <div className="task-item__body">
        <button type="button" className="task-item__title" onClick={() => ui.openEditTask(task)}>
          {task.title}
        </button>
        <div className="task-item__meta">
          {!hideProject && (
            <span className="task-item__project">
              <Folder size={13} aria-hidden="true" />
              {project ? shortName(project.name) : 'No project'}
            </span>
          )}
          <span className={`due due--${tone}`} title={formatDateLong(task.dueDate)}>
            <Clock size={13} aria-hidden="true" />
            {isDone ? formatDate(task.dueDate) : `${formatDate(task.dueDate)}, ${relativeDeadline(task.dueDate).toLowerCase()}`}
          </span>
          {assignee && (
            <span className="task-item__assignee">
              <Avatar member={assignee} size="xs" />
              <span className="task-item__assignee-name">{assignee.id === 'me' ? 'You' : assignee.name.split(' ')[0]}</span>
            </span>
          )}
        </div>
      </div>
      <div className="task-item__side">
        <PriorityBadge priority={task.priority} />
        <TaskStatusBadge status={task.status} />
        <ActionMenu
          label={`Actions for ${task.title}`}
          items={[
            { label: 'Edit task', icon: Pencil, onClick: () => ui.openEditTask(task) },
            { label: 'Delete task', icon: Trash2, danger: true, onClick: () => ui.requestDeleteTask(task) },
          ]}
        />
      </div>
    </li>
  );
}
