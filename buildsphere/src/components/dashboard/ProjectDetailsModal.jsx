import { Pencil, Plus, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { ProjectStatusBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import TaskList from './TaskList';
import { useWorkspace } from '../../context/WorkspaceContext';
import { calculateProgress, getProjectTasks, splitProjectName } from '../../utils/projectUtils';
import { formatDateLong, relativeDeadline } from '../../utils/dateUtils';

export default function ProjectDetailsModal({ projectId, ui, onClose }) {
  const { getProject, tasks, members } = useWorkspace();
  const project = getProject(projectId);
  if (!project) return null;

  const { title, subtitle } = splitProjectName(project.name);
  const projectTasks = getProjectTasks(project.id, tasks);
  const progress = calculateProgress(project, tasks);
  const team = members.filter((m) => project.teamMembers.includes(m.id));

  return (
    <Modal
      title={title}
      description={subtitle || project.category}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <Button variant="ghost" className="btn--danger-text" onClick={() => ui.requestDeleteProject(project)}>
            <Trash2 size={16} aria-hidden="true" /> Delete
          </Button>
          <span className="spacer" />
          <Button variant="secondary" onClick={() => ui.openEditProject(project)}>
            <Pencil size={16} aria-hidden="true" /> Edit project
          </Button>
          <Button onClick={() => ui.openNewTask({ projectId: project.id })}>
            <Plus size={16} aria-hidden="true" /> Add task
          </Button>
        </>
      }
    >
      <div className="details">
        <div className="details__intro">
          <ProjectStatusBadge status={project.status} />
          <p>{project.description}</p>
        </div>

        <dl className="details__meta">
          <div>
            <dt>Category</dt>
            <dd>{project.category}</dd>
          </div>
          <div>
            <dt>Start date</dt>
            <dd>{formatDateLong(project.startDate)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>
              {formatDateLong(project.dueDate)}
              {project.status !== 'completed' && <span className="muted small"> ({relativeDeadline(project.dueDate).toLowerCase()})</span>}
            </dd>
          </div>
          <div>
            <dt>Progress</dt>
            <dd className="details__progress">
              <ProgressBar value={progress} label={`${title} progress`} />
              <strong>{progress}%</strong>
            </dd>
          </div>
        </dl>

        <section aria-label="Team">
          <h3 className="details__heading">Team</h3>
          <ul className="details__team">
            {team.map((m) => (
              <li key={m.id}>
                <Avatar member={m} size="sm" />
                <span>
                  <strong>{m.id === 'me' ? `${m.name} (you)` : m.name}</strong>
                  <span className="muted small">{m.role}</span>
                </span>
              </li>
            ))}
            {team.length === 0 && <li className="muted">No members assigned.</li>}
          </ul>
        </section>

        <section aria-label="Tasks">
          <h3 className="details__heading">Tasks</h3>
          <TaskList tasks={projectTasks} ui={ui} idPrefix={`project-${project.id}`} hideProject defaultProjectId={project.id} />
        </section>
      </div>
    </Modal>
  );
}
