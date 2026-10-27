import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ProjectFormModal from '../forms/ProjectFormModal';
import TaskFormModal from '../forms/TaskFormModal';
import ProjectDetailsModal from '../dashboard/ProjectDetailsModal';
import ConfirmDialog from '../common/ConfirmDialog';
import { DeleteAllDataDialog, LoadDemoDataDialog } from '../forms/DemoDataDialogs';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { getProjectTasks, shortName } from '../../utils/projectUtils';
import { readJSON, writeJSON } from '../../utils/storage';
import '../../styles/app.css';

const PAGE_TITLES = {
  '/app': 'Dashboard',
  '/app/projects': 'My Projects',
  '/app/tasks': 'My Tasks',
  '/app/team': 'Team',
  '/app/resources': 'Resources',
  '/app/calendar': 'Calendar',
  '/app/settings': 'Settings',
  '/app/help': 'Help & Support',
};

export default function DashboardLayout() {
  const { logout } = useAuth();
  const { prefs, tasks, deleteProject, deleteTask } = useWorkspace();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => readJSON('buildsphere:sidebar-collapsed', false));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Modal state lives here so any page can open the same dialogs.
  const [projectForm, setProjectForm] = useState(null);
  const [taskForm, setTaskForm] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dataDialog, setDataDialog] = useState(null); // 'load' | 'delete' | null

  const title = PAGE_TITLES[location.pathname.replace(/\/$/, '')] || 'Workspace';

  useEffect(() => {
    document.title = `${title} — BuildSphere`;
  }, [title]);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // Apply the theme preference to the whole document while the app is open.
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.dataset.theme = prefs.theme === 'system' ? (media.matches ? 'dark' : 'light') : prefs.theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => {
      media.removeEventListener('change', apply);
      delete root.dataset.theme;
    };
  }, [prefs.theme]);

  function toggleCollapse() {
    setCollapsed((value) => {
      writeJSON('buildsphere:sidebar-collapsed', !value);
      return !value;
    });
  }

  const handleLogout = useCallback(() => {
    logout();
    showToast('You’ve been logged out of the demo workspace', 'info');
    navigate('/login');
  }, [logout, navigate, showToast]);

  // After deleting everything, drop anything that points at old records.
  const resetViewState = useCallback(() => {
    setSearch('');
    setDetailsId(null);
    setProjectForm(null);
    setTaskForm(null);
    setConfirm(null);
  }, []);

  const ui = useMemo(
    () => ({
      search,
      setSearch,
      openNewProject: () => setProjectForm({}),
      openEditProject: (project) => setProjectForm({ project }),
      openNewTask: (defaults = {}) => setTaskForm({ defaults }),
      openEditTask: (task) => task && setTaskForm({ task }),
      openProject: (id) => setDetailsId(id),
      confirm: (options) => setConfirm(options),
      requestDeleteProject: (project) => {
        const count = getProjectTasks(project.id, tasks).length;
        setConfirm({
          title: 'Delete this project?',
          message: `“${shortName(project.name)}” and its ${count} task${count === 1 ? '' : 's'} will be removed from this workspace. This can’t be undone.`,
          confirmLabel: 'Delete project',
          onConfirm: () => {
            deleteProject(project.id);
            setDetailsId((id) => (id === project.id ? null : id));
            showToast(`Deleted ${shortName(project.name)}`);
          },
        });
      },
      requestDeleteTask: (task) => {
        setConfirm({
          title: 'Delete this task?',
          message: `“${task.title}” will be removed from its project. This can’t be undone.`,
          confirmLabel: 'Delete task',
          onConfirm: () => {
            deleteTask(task.id);
            showToast('Task deleted');
          },
        });
      },
    }),
    [search, tasks, deleteProject, deleteTask, showToast]
  );

  return (
    <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <Header
          title={title}
          onOpenDrawer={() => setDrawerOpen(true)}
          ui={ui}
          onLogout={handleLogout}
          onLoadDemo={() => setDataDialog('load')}
          onDeleteData={() => setDataDialog('delete')}
        />
        <main id="main-content" className="app-content" tabIndex={-1}>
          <Outlet context={ui} />
        </main>
      </div>

      {detailsId && <ProjectDetailsModal projectId={detailsId} ui={ui} onClose={() => setDetailsId(null)} />}
      {projectForm && <ProjectFormModal project={projectForm.project} onClose={() => setProjectForm(null)} />}
      {taskForm && <TaskFormModal task={taskForm.task} defaults={taskForm.defaults} onClose={() => setTaskForm(null)} />}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
      {dataDialog === 'load' && <LoadDemoDataDialog onClose={() => setDataDialog(null)} />}
      {dataDialog === 'delete' && <DeleteAllDataDialog onClose={() => setDataDialog(null)} onDeleted={resetViewState} />}
    </div>
  );
}
