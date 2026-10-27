import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, CalendarClock, CheckCircle2, ChevronDown, DatabaseZap, Folder, Trash2, ListChecks, LogOut, Menu, Search, Settings, User, Users, X,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import useDismiss from '../../hooks/useDismiss';
import { useWorkspace } from '../../context/WorkspaceContext';
import { matchesQuery, shortName } from '../../utils/projectUtils';
import { timeAgo } from '../../utils/dateUtils';

const NOTIFICATION_ICONS = { deadline: CalendarClock, task: CheckCircle2, team: Users };

export default function Header({ title, onOpenDrawer, ui, onLogout, onLoadDemo, onDeleteData }) {
  const { projects, tasks, members, notifications, unreadCount, markNotificationsRead } = useWorkspace();
  const me = members.find((m) => m.id === 'me');
  const [openPanel, setOpenPanel] = useState(null); // 'notifications' | 'profile' | null
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const profileButtonRef = useRef(null);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closePanel = useCallback(() => setOpenPanel(null), []);
  useDismiss(searchRef, closeSearch, searchOpen);
  useDismiss(openPanel === 'notifications' ? notifRef : profileRef, closePanel, Boolean(openPanel));

  const query = ui.search;
  const results = useMemo(() => {
    if (!query.trim()) return { projects: [], tasks: [] };
    return {
      projects: projects.filter((p) => matchesQuery([p.name, p.description, p.category, ...(p.tags || [])], query)).slice(0, 4),
      tasks: tasks.filter((t) => matchesQuery([t.title, t.description], query)).slice(0, 5),
    };
  }, [query, projects, tasks]);
  const hasResults = results.projects.length + results.tasks.length > 0;

  // Close the menu and hand focus back to the profile button, so the dialog
  // can return focus there when it closes.
  function runFromProfileMenu(action) {
    setOpenPanel(null);
    profileButtonRef.current?.focus();
    action();
  }

  function togglePanel(name) {
    setOpenPanel((current) => (current === name ? null : name));
  }

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onOpenDrawer} aria-label="Open navigation" aria-controls="app-sidebar">
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="topbar__title">
        <span className="topbar__crumb">Workspace</span>
        <h1>{title}</h1>
      </div>

      <div className="topbar__search" ref={searchRef}>
        <Search size={17} aria-hidden="true" className="topbar__search-icon" />
        <label htmlFor="global-search" className="sr-only">Search projects and tasks</label>
        <input
          id="global-search"
          type="search"
          placeholder="Search projects and tasks"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            ui.setSearch(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
        />
        {query && (
          <button type="button" className="topbar__search-clear" onClick={() => ui.setSearch('')} aria-label="Clear search">
            <X size={15} aria-hidden="true" />
          </button>
        )}
        {searchOpen && query.trim() && (
          <div className="dropdown search-results" role="region" aria-label="Search results">
            {!hasResults && <p className="search-results__empty">No projects or tasks match “{query}”.</p>}
            {results.projects.length > 0 && (
              <>
                <p className="dropdown__heading">Projects</p>
                {results.projects.map((p) => (
                  <button key={p.id} type="button" className="dropdown__item" onClick={() => { setSearchOpen(false); ui.openProject(p.id); }}>
                    <Folder size={16} aria-hidden="true" />
                    <span>{shortName(p.name)}</span>
                  </button>
                ))}
              </>
            )}
            {results.tasks.length > 0 && (
              <>
                <p className="dropdown__heading">Tasks</p>
                {results.tasks.map((t) => (
                  <button key={t.id} type="button" className="dropdown__item" onClick={() => { setSearchOpen(false); ui.openEditTask(t); }}>
                    <ListChecks size={16} aria-hidden="true" />
                    <span>{t.title}</span>
                  </button>
                ))}
              </>
            )}
            {hasResults && <p className="search-results__hint">Lists on this page are filtered too.</p>}
          </div>
        )}
      </div>

      <div className="topbar__actions">
        <div className="topbar__popover" ref={notifRef}>
          <button
            type="button"
            className="icon-btn topbar__bell"
            onClick={() => togglePanel('notifications')}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={openPanel === 'notifications'}
            aria-haspopup="true"
          >
            <Bell size={19} aria-hidden="true" />
            {unreadCount > 0 && <span className="topbar__badge" aria-hidden="true">{unreadCount}</span>}
          </button>
          {openPanel === 'notifications' && (
            <div className="dropdown notifications">
              <div className="notifications__head">
                <h2>Notifications</h2>
                {unreadCount > 0 && (
                  <button type="button" className="link-btn" onClick={() => markNotificationsRead(notifications.map((n) => n.id))}>
                    Mark all as read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="notifications__empty">You’re all caught up. Notification types can be turned on in Settings.</p>
              ) : (
                <ul className="notifications__list">
                  {notifications.map((n) => {
                    const Icon = NOTIFICATION_ICONS[n.type] || Bell;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`notification ${n.read ? '' : 'is-unread'} ${n.urgent ? 'is-urgent' : ''}`}
                          onClick={() => markNotificationsRead([n.id])}
                        >
                          <span className="notification__icon"><Icon size={16} aria-hidden="true" /></span>
                          <span className="notification__body">
                            <span className="notification__title">{n.title}</span>
                            <span className="notification__meta">{n.body}{n.at ? `, ${timeAgo(n.at)}` : ''}</span>
                          </span>
                          {!n.read && <span className="notification__dot"><span className="sr-only">Unread</span></span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="notifications__foot">
                {notifications.some((n) => n.demo) ? 'Includes sample notifications from the demo data.' : 'Deadline reminders come from your tasks.'}
              </p>
            </div>
          )}
        </div>

        <div className="topbar__popover" ref={profileRef}>
          <button
            ref={profileButtonRef}
            type="button"
            className="topbar__profile"
            onClick={() => togglePanel('profile')}
            aria-expanded={openPanel === 'profile'}
            aria-haspopup="true"
            aria-label={`Account menu for ${me?.name}`}
          >
            <Avatar member={me} size="sm" showTitle={false} />
            <span className="topbar__profile-name">{me?.name}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
          {openPanel === 'profile' && (
            <div className="dropdown profile-menu">
              <div className="profile-menu__head">
                <strong>{me?.name}</strong>
                <span>{me?.email}</span>
              </div>
              <Link to="/app/settings#profile" className="dropdown__item" onClick={closePanel}>
                <User size={16} aria-hidden="true" /> View Profile
              </Link>
              <Link to="/app/settings" className="dropdown__item" onClick={closePanel}>
                <Settings size={16} aria-hidden="true" /> Settings
              </Link>
              <div className="dropdown__divider" role="separator" />
              <button type="button" className="dropdown__item dropdown__item--stacked" onClick={() => runFromProfileMenu(onLoadDemo)}>
                <DatabaseZap size={16} aria-hidden="true" />
                <span>
                  <span className="dropdown__label">Load Demo Data</span>
                  <span className="dropdown__description">Populate your workspace with sample projects and tasks.</span>
                </span>
              </button>
              <button type="button" className="dropdown__item dropdown__item--stacked dropdown__item--danger" onClick={() => runFromProfileMenu(onDeleteData)}>
                <Trash2 size={16} aria-hidden="true" />
                <span>
                  <span className="dropdown__label">Delete All Data</span>
                  <span className="dropdown__description">Clear your saved workspace data.</span>
                </span>
              </button>
              <div className="dropdown__divider" role="separator" />
              <button type="button" className="dropdown__item" onClick={onLogout}>
                <LogOut size={16} aria-hidden="true" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
