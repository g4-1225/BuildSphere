import { CalendarDays, Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge, ProjectStatusBadge } from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { AvatarStack } from '../common/Avatar';
import ActionMenu from '../common/ActionMenu';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateProgress, getProjectTasks, splitProjectName } from '../../utils/projectUtils';
import { deadlineTone, formatDateLong, relativeDeadline } from '../../utils/dateUtils';

export default function ProjectCard({ project, ui }) {
  const { tasks, members } = useWorkspace();
  const { title, subtitle } = splitProjectName(project.name);
  const projectTasks = getProjectTasks(project.id, tasks);
  const done = projectTasks.filter((t) => t.status === 'completed').length;
  const progress = calculateProgress(project, tasks);
  const team = project.teamMembers.map((id) => members.find((m) => m.id === id)).filter(Boolean);
  const isDone = project.status === 'completed';
  const tone = deadlineTone(project.dueDate, isDone);

  return (
    <article className="project-card">
      <div className="project-card__top">
        <span className="project-card__badges">
          <ProjectStatusBadge status={project.status} />
          {project.demo && <Badge tone="neutral">Sample</Badge>}
        </span>
        <ActionMenu
          label={`Actions for ${title}`}
          items={[
            { label: 'View details', icon: Eye, onClick: () => ui.openProject(project.id) },
            { label: 'Edit project', icon: Pencil, onClick: () => ui.openEditProject(project) },
            { label: 'Delete project', icon: Trash2, danger: true, onClick: () => ui.requestDeleteProject(project) },
          ]}
        />
      </div>

      <h3 className="project-card__title">
        <button type="button" className="project-card__link" onClick={() => ui.openProject(project.id)}>
          {title}
        </button>
      </h3>
      {subtitle && <p className="project-card__subtitle">{subtitle}</p>}
      <p className="project-card__desc">{project.description}</p>

      <ul className="tag-list" aria-label="Category and tags">
        <li className="tag tag--category">{project.category}</li>
        {(project.tags || []).map((tag) => <li key={tag} className="tag">{tag}</li>)}
      </ul>

      <div className="project-card__progress">
        <div className="project-card__progress-row">
          <span>{projectTasks.length ? `${done} of ${projectTasks.length} tasks` : 'No tasks yet'}</span>
          <strong>{progress}%</strong>
        </div>
        <ProgressBar value={progress} label={`${title} progress`} />
      </div>

      <footer className="project-card__footer">
        <AvatarStack members={team} max={3} />
        <span className={`due due--${tone}`} title={formatDateLong(project.dueDate)}>
          <CalendarDays size={14} aria-hidden="true" />
          {isDone ? `Submitted ${formatDateLong(project.dueDate)}` : relativeDeadline(project.dueDate)}
        </span>
      </footer>
    </article>
  );
}
