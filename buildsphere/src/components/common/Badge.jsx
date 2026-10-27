import { CheckCircle2, CircleDot, Flag, PauseCircle, Circle } from 'lucide-react';
import { PRIORITY, PROJECT_STATUS, TASK_STATUS } from '../../utils/projectUtils';

export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {Icon && <Icon size={13} aria-hidden="true" />}
      {children}
    </span>
  );
}

const PROJECT_TONE = {
  'in-progress': { tone: 'accent', icon: CircleDot },
  completed: { tone: 'success', icon: CheckCircle2 },
  'on-hold': { tone: 'warning', icon: PauseCircle },
};

export function ProjectStatusBadge({ status }) {
  const config = PROJECT_TONE[status] || PROJECT_TONE['in-progress'];
  return (
    <Badge tone={config.tone} icon={config.icon}>
      {PROJECT_STATUS[status]}
    </Badge>
  );
}

const TASK_TONE = {
  todo: { tone: 'neutral', icon: Circle },
  'in-progress': { tone: 'accent', icon: CircleDot },
  completed: { tone: 'success', icon: CheckCircle2 },
};

export function TaskStatusBadge({ status }) {
  const config = TASK_TONE[status] || TASK_TONE.todo;
  return (
    <Badge tone={config.tone} icon={config.icon}>
      {TASK_STATUS[status]}
    </Badge>
  );
}

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' };

export function PriorityBadge({ priority }) {
  return (
    <Badge tone={PRIORITY_TONE[priority]} icon={Flag} className="badge--priority">
      {PRIORITY[priority]}
    </Badge>
  );
}
