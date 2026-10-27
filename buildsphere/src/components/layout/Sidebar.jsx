import { Link, NavLink } from 'react-router-dom';
import {
  CalendarDays, FolderKanban, LayoutDashboard, LifeBuoy, ListChecks, LogOut,
  PanelLeftClose, PanelLeftOpen, Paperclip, Settings, Users, X,
} from 'lucide-react';
import Logo from '../common/Logo';
import { Avatar } from '../common/Avatar';
import { useWorkspace } from '../../context/WorkspaceContext';

const MAIN_NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/projects', label: 'My Projects', icon: FolderKanban },
  { to: '/app/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/app/team', label: 'Team', icon: Users },
  { to: '/app/resources', label: 'Resources', icon: Paperclip },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
];

const SECONDARY_NAV = [
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/help', label: 'Help & Support', icon: LifeBuoy },
];

function SidebarLink({ item, collapsed, badge }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={19} aria-hidden="true" />
      <span className="sidebar__label">{item.label}</span>
      {badge > 0 && (
        <span className="sidebar__badge" aria-label={`${badge} open`}>
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, drawerOpen, onCloseDrawer, onLogout }) {
  const { tasks, members } = useWorkspace();
  const me = members.find((m) => m.id === 'me');
  const myOpenTasks = tasks.filter((t) => t.assignedTo === 'me' && t.status !== 'completed').length;

  return (
    <>
      <div className={`sidebar-backdrop ${drawerOpen ? 'is-visible' : ''}`} onClick={onCloseDrawer} aria-hidden="true" />
      <aside id="app-sidebar" className={`sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar__top">
          <Link to="/app" className="sidebar__brand" aria-label="BuildSphere dashboard">
            <Logo size={32} />
            <span className="sidebar__label sidebar__brand-name">BuildSphere</span>
          </Link>
          <button type="button" className="icon-btn icon-btn--dark sidebar__close" onClick={onCloseDrawer} aria-label="Close navigation">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Workspace">
          <ul>
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} collapsed={collapsed} badge={item.to === '/app/tasks' ? myOpenTasks : 0} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar__bottom">
          <ul>
            {SECONDARY_NAV.map((item) => (
              <li key={item.to}>
                <SidebarLink item={item} collapsed={collapsed} />
              </li>
            ))}
          </ul>

          <Link to="/app/settings" className="sidebar__profile" title={collapsed ? me?.name : undefined}>
            <Avatar member={me} size="sm" showTitle={false} />
            <span className="sidebar__label sidebar__profile-text">
              <strong>{me?.name}</strong>
              <span>{me?.role}</span>
            </span>
          </Link>

          <button type="button" className="sidebar__link sidebar__logout" onClick={onLogout} title={collapsed ? 'Log out' : undefined}>
            <LogOut size={19} aria-hidden="true" />
            <span className="sidebar__label">Log out</span>
          </button>

          <button
            type="button"
            className="sidebar__collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
          >
            {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
            <span className="sidebar__label">Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
