import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ProjectCard from '../components/dashboard/ProjectCard';
import SearchNotice from './SearchNotice';
import PageHeader from './PageHeader';
import { useWorkspace } from '../context/WorkspaceContext';
import { calculateProgress, filterProjects, PROJECT_STATUS } from '../utils/projectUtils';

const FILTERS = [{ id: 'all', label: 'All' }, ...Object.entries(PROJECT_STATUS).map(([id, label]) => ({ id, label }))];

export default function ProjectsPage() {
  const ui = useOutletContext();
  const { projects, tasks } = useWorkspace();
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('due');

  const searched = filterProjects(projects, { query: ui.search });
  const visible = filterProjects(searched, { status }).sort((a, b) => {
    if (sortBy === 'progress') return calculateProgress(b, tasks) - calculateProgress(a, tasks);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'newest') return b.createdAt - a.createdAt;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="page">
      <PageHeader
        title="My Projects"
        text="Every project you lead or contribute to."
        action={<Button onClick={ui.openNewProject}><Plus size={18} aria-hidden="true" /> New Project</Button>}
      />
      <SearchNotice ui={ui} count={searched.length} noun="projects" />

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => {
            const count = f.id === 'all' ? searched.length : searched.filter((p) => p.status === f.id).length;
            return (
              <button key={f.id} type="button" className={`chip ${status === f.id ? 'is-active' : ''}`} aria-pressed={status === f.id} onClick={() => setStatus(f.id)}>
                {f.label} <span className="chip__count">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="select-inline">
          <span className="sr-only">Sort projects</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="due">Sort: due date</option>
            <option value="progress">Sort: progress</option>
            <option value="name">Sort: name</option>
            <option value="newest">Sort: newest</option>
          </select>
        </label>
      </div>

      {visible.length > 0 ? (
        <div className="project-grid project-grid--page">
          {visible.map((project) => <ProjectCard key={project.id} project={project} ui={ui} />)}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            icon={FolderKanban}
            title={projects.length ? 'No projects match these filters' : 'No projects yet'}
            text={projects.length ? 'Try another status or clear the search.' : 'Create a project to bring your tasks, team and deadlines together.'}
            action={<Button onClick={ui.openNewProject}><Plus size={16} aria-hidden="true" /> Create Project</Button>}
          />
        </div>
      )}
    </div>
  );
}
