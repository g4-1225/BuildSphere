import { Link, useOutletContext } from 'react-router-dom';
import { CalendarClock, CheckCircle2, FolderKanban, Hourglass, Plus } from 'lucide-react';
import Button from '../components/common/Button';
import Panel from '../components/common/Panel';
import EmptyState from '../components/common/EmptyState';
import ProgressBar from '../components/common/ProgressBar';
import StatCard from '../components/dashboard/StatCard';
import ProjectCard from '../components/dashboard/ProjectCard';
import TaskList from '../components/dashboard/TaskList';
import DeadlinePanel from '../components/dashboard/DeadlinePanel';
import ActivityPanel from '../components/dashboard/ActivityPanel';
import SearchNotice from './SearchNotice';
import { useWorkspace } from '../context/WorkspaceContext';
import { computeStats, filterProjects, filterTasks } from '../utils/projectUtils';
import { getGreeting } from '../utils/dateUtils';

const pad = (n) => String(n).padStart(2, '0');
const STATUS_ORDER = { 'in-progress': 0, 'on-hold': 1, completed: 2 };

export default function DashboardPage() {
  const ui = useOutletContext();
  const { projects, tasks, members } = useWorkspace();
  const me = members.find((m) => m.id === 'me');
  const firstName = (me?.name || 'there').split(' ')[0];

  const stats = computeStats(projects, tasks);
  const completion = stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  const visibleProjects = filterProjects(projects, { query: ui.search }).sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.dueDate.localeCompare(b.dueDate)
  );
  const visibleTasks = filterTasks(tasks, projects, { query: ui.search });

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <h2 className="welcome__title">{getGreeting()}, {firstName}!</h2>
          <p className="welcome__text">Here’s what’s happening with your projects today.</p>
        </div>
        <Button onClick={ui.openNewProject}>
          <Plus size={18} aria-hidden="true" /> New Project
        </Button>
      </section>

      <SearchNotice ui={ui} count={visibleProjects.length + visibleTasks.length} />

      <section className="stats-grid" aria-label="Workspace summary">
        <StatCard icon={FolderKanban} label="Active Projects" value={pad(stats.activeProjects)} tone="accent"
          meta={`${stats.totalProjects} in total, ${stats.onHoldProjects} on hold`} />
        <StatCard icon={CheckCircle2} label="Tasks Completed" tone="success"
          value={<>{pad(stats.completedTasks)}<span className="stat-card__of"> / {pad(stats.totalTasks)}</span></>}
          meta={`${completion}% of all tasks done`}>
          <ProgressBar value={completion} size="sm" label="Overall task completion" tone="success" />
        </StatCard>
        <StatCard icon={Hourglass} label="Pending Tasks" value={pad(stats.pendingTasks)} tone="warning"
          meta={`${stats.inProgressTasks} in progress, ${stats.todoTasks} to do`} />
        <StatCard icon={CalendarClock} label="Upcoming Deadlines" value={pad(stats.upcomingDeadlines)} tone="danger"
          meta={stats.overdue > 0 ? `Next 14 days, plus ${stats.overdue} overdue` : 'In the next 14 days'} />
      </section>

      <div className="dash-grid">
        <div className="dash-grid__main">
          <Panel
            title="My Projects"
            subtitle={`${visibleProjects.length} project${visibleProjects.length === 1 ? '' : 's'}`}
            actions={
              <>
                <Link to="/app/projects" className="link-btn">View All</Link>
                <Button size="sm" variant="secondary" onClick={ui.openNewProject}>
                  <Plus size={16} aria-hidden="true" /> Create Project
                </Button>
              </>
            }
          >
            {visibleProjects.length > 0 ? (
              <div className="project-grid">
                {visibleProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} ui={ui} />)}
              </div>
            ) : (
              <EmptyState
                icon={FolderKanban}
                title={projects.length ? 'No projects match your search' : 'No projects yet'}
                text={projects.length ? 'Try a different word, or clear the search.' : 'Create a project to start adding tasks, teammates and deadlines.'}
                action={!projects.length && <Button onClick={ui.openNewProject}><Plus size={16} aria-hidden="true" /> Create Project</Button>}
              />
            )}
          </Panel>

          <Panel
            title="My Tasks"
            subtitle="Tick a task to mark it done. Progress updates instantly."
            actions={
              <>
                <Link to="/app/tasks" className="link-btn">View All</Link>
                <Button size="sm" onClick={() => ui.openNewTask()}>
                  <Plus size={16} aria-hidden="true" /> New Task
                </Button>
              </>
            }
          >
            <TaskList tasks={visibleTasks} ui={ui} limit={6} idPrefix="dash-tasks" />
          </Panel>
        </div>

        <div className="dash-grid__side">
          <DeadlinePanel ui={ui} />
          <ActivityPanel />
        </div>
      </div>
    </div>
  );
}
