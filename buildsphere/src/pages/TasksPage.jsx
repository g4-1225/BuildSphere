import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import TaskList from '../components/dashboard/TaskList';
import SearchNotice from './SearchNotice';
import PageHeader from './PageHeader';
import { useWorkspace } from '../context/WorkspaceContext';
import { filterTasks, shortName } from '../utils/projectUtils';

export default function TasksPage() {
  const ui = useOutletContext();
  const { projects, tasks } = useWorkspace();
  const [projectId, setProjectId] = useState('all');
  const [mineOnly, setMineOnly] = useState(false);

  const visible = filterTasks(tasks, projects, { query: ui.search, projectId }).filter((t) => !mineOnly || t.assignedTo === 'me');
  const done = visible.filter((t) => t.status === 'completed').length;
  const percent = visible.length ? Math.round((done / visible.length) * 100) : 0;

  return (
    <div className="page">
      <PageHeader
        title="My Tasks"
        text="Everything your teams need to get done, across all projects."
        action={<Button onClick={() => ui.openNewTask(projectId !== 'all' ? { projectId } : {})}><Plus size={18} aria-hidden="true" /> New Task</Button>}
      />
      <SearchNotice ui={ui} count={visible.length} noun="tasks" />

      <section className="panel">
        <div className="toolbar toolbar--spaced">
          <div className="toolbar__group">
            <label className="select-inline">
              <span className="sr-only">Project</span>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="all">All projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)}</option>)}
              </select>
            </label>
            <label className="switch">
              <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
              <span className="switch__track" aria-hidden="true" />
              Assigned to me
            </label>
          </div>
          <div className="completion" aria-label={`${done} of ${visible.length} tasks done`}>
            <span className="completion__text"><strong>{done}</strong> of {visible.length} done</span>
            <ProgressBar value={percent} size="sm" label="Completion of listed tasks" />
          </div>
        </div>
        <TaskList tasks={visible} ui={ui} idPrefix="all-tasks" defaultProjectId={projectId !== 'all' ? projectId : undefined} />
      </section>
    </div>
  );
}
