import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getDemoData } from '../data/mockData';
import { readJSON, writeJSON } from '../utils/storage';
import {
  clearWorkspaceData, countWorkspaceRecords, createSeedWorkspace, isDemoDataLoaded, mergeDemoData,
  normalizeWorkspace, summarizeDemoData,
} from '../utils/workspaceData';
import { daysUntil, startOfToday, toISODate } from '../utils/dateUtils';
import { getFileType, getInitials, shortName, uid } from '../utils/projectUtils';

/*
 * Holds all workspace data (projects, tasks, team, resources, activity)
 * for the signed-in demo user and saves it to localStorage on every change.
 */

const WorkspaceContext = createContext(null);
const MAX_ACTIVITY = 30;

const STORAGE_ERROR = 'Couldn’t save to this browser’s storage (it may be full or blocked). Nothing was changed.';

/** Saved workspace if there is one; a brand-new account starts with the demo data. */
function loadWorkspace(key, user) {
  return normalizeWorkspace(readJSON(key), user) ?? createSeedWorkspace(user);
}

/** Adds an entry to the activity feed (newest first). */
function withActivity(state, entry) {
  const item = { id: uid('a'), actorId: 'me', at: Date.now(), project: '', ...entry };
  return { ...state, activity: [item, ...state.activity].slice(0, MAX_ACTIVITY) };
}

function deadlineText(days) {
  if (days < 0) return 'is overdue';
  if (days === 0) return 'is due today';
  if (days === 1) return 'is due tomorrow';
  return `is due in ${days} days`;
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const storageKey = `buildsphere:workspace:${user.email}`;
  const [data, setData] = useState(() => loadWorkspace(storageKey, user));
  const dataRef = useRef(data);
  dataRef.current = data;
  const lastSavedRef = useRef(null);

  // Object URLs for files picked in this tab. They can't be saved, so they're kept in memory only.
  const [fileUrls, setFileUrls] = useState({});
  const fileUrlsRef = useRef(fileUrls);
  fileUrlsRef.current = fileUrls;

  // Save every change. Skips the write when commit() below has already saved this exact state.
  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized === lastSavedRef.current) return;
    if (writeJSON(storageKey, data)) lastSavedRef.current = serialized;
  }, [storageKey, data]);

  /**
   * Whole-workspace changes: save first, then update React state.
   * If saving fails, state is left untouched so storage and UI never disagree.
   */
  const commit = useCallback(
    (next) => {
      if (!writeJSON(storageKey, next)) throw new Error(STORAGE_ERROR);
      lastSavedRef.current = JSON.stringify(next);
      dataRef.current = next; // guards against a second call before React re-renders
      setData(next);
    },
    [storageKey]
  );

  const revokeFileUrls = useCallback(() => {
    Object.values(fileUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    setFileUrls({});
  }, []);

  useEffect(() => () => Object.values(fileUrlsRef.current).forEach((url) => URL.revokeObjectURL(url)), []);

  const projectName = useCallback(
    (state, projectId) => shortName(state.projects.find((p) => p.id === projectId)?.name || ''),
    []
  );

  /* ---------- Projects ---------- */

  const addProject = useCallback((input) => {
    const project = { ...input, id: uid('project'), createdAt: Date.now() };
    setData((state) =>
      withActivity({ ...state, projects: [project, ...state.projects] }, { action: 'created the project', target: shortName(project.name) })
    );
    return project;
  }, []);

  const updateProject = useCallback((id, changes) => {
    setData((state) => {
      const before = state.projects.find((p) => p.id === id);
      if (!before) return state;
      let action = 'updated the project';
      if (changes.dueDate && changes.dueDate !== before.dueDate) action = 'updated the deadline for';
      else if (changes.status && changes.status !== before.status) action = 'changed the status of';
      const projects = state.projects.map((p) => (p.id === id ? { ...p, ...changes } : p));
      return withActivity({ ...state, projects }, { action, target: shortName(changes.name || before.name) });
    });
  }, []);

  const deleteProject = useCallback((id) => {
    setData((state) => {
      const project = state.projects.find((p) => p.id === id);
      return withActivity(
        {
          ...state,
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          resources: state.resources.map((r) => (r.projectId === id ? { ...r, projectId: null } : r)),
        },
        { action: 'deleted the project', target: shortName(project?.name || 'Untitled') }
      );
    });
  }, []);

  /* ---------- Tasks ---------- */

  const addTask = useCallback(
    (input) => {
      const task = { ...input, id: uid('task'), createdAt: Date.now() };
      setData((state) =>
        withActivity(
          { ...state, tasks: [task, ...state.tasks] },
          { action: 'added a new task', target: task.title, project: projectName(state, task.projectId) }
        )
      );
      return task;
    },
    [projectName]
  );

  const updateTask = useCallback(
    (id, changes) => {
      setData((state) => {
        const before = state.tasks.find((t) => t.id === id);
        if (!before) return state;
        const after = { ...before, ...changes };
        let action = 'updated the task';
        if (after.status !== before.status) {
          action = after.status === 'completed' ? 'marked complete' : `moved to ${after.status === 'todo' ? 'To Do' : 'In Progress'}`;
        } else if (after.dueDate !== before.dueDate) action = 'updated the deadline for';
        return withActivity(
          { ...state, tasks: state.tasks.map((t) => (t.id === id ? after : t)) },
          { action, target: after.title, project: projectName(state, after.projectId) }
        );
      });
    },
    [projectName]
  );

  /** Checkbox behaviour: done ↔ to do. */
  const toggleTask = useCallback(
    (id) => {
      setData((state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return state;
        const status = task.status === 'completed' ? 'todo' : 'completed';
        return withActivity(
          { ...state, tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)) },
          { action: status === 'completed' ? 'marked complete' : 'reopened', target: task.title, project: projectName(state, task.projectId) }
        );
      });
    },
    [projectName]
  );

  const deleteTask = useCallback(
    (id) => {
      setData((state) => {
        const task = state.tasks.find((t) => t.id === id);
        return withActivity(
          { ...state, tasks: state.tasks.filter((t) => t.id !== id) },
          { action: 'deleted the task', target: task?.title || 'Untitled', project: projectName(state, task?.projectId) }
        );
      });
    },
    [projectName]
  );

  /* ---------- Team ---------- */

  const addMember = useCallback(({ name, email, role, projectId }) => {
    const member = { id: uid('member'), name: name.trim(), email: email.trim().toLowerCase(), role, initials: getInitials(name) };
    setData((state) => {
      const projects = projectId
        ? state.projects.map((p) => (p.id === projectId ? { ...p, teamMembers: [...p.teamMembers, member.id] } : p))
        : state.projects;
      return withActivity(
        { ...state, members: [...state.members, member], projects },
        { action: 'added a teammate', target: member.name, project: projectId ? projectName(state, projectId) : '' }
      );
    });
    return member;
  }, [projectName]);

  const updateMember = useCallback((id, changes) => {
    setData((state) => ({
      ...state,
      members: state.members.map((m) =>
        m.id === id ? { ...m, ...changes, initials: getInitials(changes.name ?? m.name) } : m
      ),
    }));
  }, []);

  const removeMember = useCallback((id) => {
    setData((state) => {
      const member = state.members.find((m) => m.id === id);
      return withActivity(
        {
          ...state,
          members: state.members.filter((m) => m.id !== id),
          projects: state.projects.map((p) => ({ ...p, teamMembers: p.teamMembers.filter((mid) => mid !== id) })),
          tasks: state.tasks.map((t) => (t.assignedTo === id ? { ...t, assignedTo: '' } : t)),
        },
        { action: 'removed a teammate', target: member?.name || '' }
      );
    });
  }, []);

  /* ---------- Resources ---------- */

  const addResources = useCallback((files, projectId) => {
    const today = toISODate(startOfToday());
    const newUrls = {};
    const items = files.map((file) => {
      const id = uid('res');
      newUrls[id] = URL.createObjectURL(file);
      return { id, title: file.name, type: getFileType(file.name), projectId: projectId || null, uploadedAt: today, size: file.size };
    });
    setFileUrls((urls) => ({ ...urls, ...newUrls }));
    setData((state) =>
      withActivity(
        { ...state, resources: [...items, ...state.resources] },
        {
          action: 'added',
          target: items.length === 1 ? items[0].title : `${items.length} files`,
          project: projectId ? shortName(state.projects.find((p) => p.id === projectId)?.name || '') : '',
        }
      )
    );
  }, []);

  const deleteResource = useCallback((id) => {
    setFileUrls((urls) => {
      if (urls[id]) URL.revokeObjectURL(urls[id]);
      const { [id]: _removed, ...rest } = urls;
      return rest;
    });
    setData((state) => ({ ...state, resources: state.resources.filter((r) => r.id !== id) }));
  }, []);

  /* ---------- Preferences & notifications ---------- */

  const updatePrefs = useCallback((changes) => {
    setData((state) => ({ ...state, prefs: { ...state.prefs, ...changes } }));
  }, []);

  const markNotificationsRead = useCallback((ids) => {
    setData((state) => ({
      ...state,
      readNotificationIds: Array.from(new Set([...state.readNotificationIds, ...ids])).slice(-200),
    }));
  }, []);

  /* ---------- Whole-workspace actions ---------- */

  /**
   * Adds the demo records alongside whatever is already there.
   * Does nothing if demo data is already present, so it can't create duplicates.
   */
  const loadDemoData = useCallback(() => {
    const current = dataRef.current;
    if (isDemoDataLoaded(current)) return { status: 'already-loaded' };
    const demo = getDemoData(user);
    commit(mergeDemoData(current, demo));
    return { status: 'loaded', added: summarizeDemoData(demo) };
  }, [commit, user]);

  /** Clears projects, tasks, teammates, resources, activity and notifications. Keeps the user, session and preferences. */
  const deleteAllWorkspaceData = useCallback(() => {
    commit(clearWorkspaceData(dataRef.current));
    revokeFileUrls();
  }, [commit, revokeFileUrls]);

  /** Settings → Reset: replace everything with a fresh copy of the demo data (preferences kept). */
  const resetWorkspace = useCallback(() => {
    commit(createSeedWorkspace(user, dataRef.current.prefs));
    revokeFileUrls();
  }, [commit, revokeFileUrls, user]);

  const recordCounts = useMemo(() => countWorkspaceRecords(data), [data]);
  const demoLoaded = useMemo(() => isDemoDataLoaded(data), [data]);

  // Deadline reminders are generated from task data, so they always match the dashboard.
  const notifications = useMemo(() => {
    const { prefs, tasks, projects, storedNotifications, readNotificationIds } = data;
    const list = [];
    if (prefs.deadlineReminders) {
      tasks
        .filter((t) => t.status !== 'completed' && daysUntil(t.dueDate) !== null && daysUntil(t.dueDate) <= 2)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .forEach((t) => {
          const days = daysUntil(t.dueDate);
          if (days < -14) return;
          list.push({
            id: `due:${t.id}:${t.dueDate}`,
            type: 'deadline',
            title: `${t.title} ${deadlineText(days)}`,
            body: shortName(projects.find((p) => p.id === t.projectId)?.name || ''),
            urgent: days <= 0,
          });
        });
    }
    storedNotifications.forEach((n) => {
      if (n.type === 'task' && !prefs.taskUpdates) return;
      if (n.type === 'team' && !prefs.teamActivity) return;
      list.push(n);
    });
    return list.map((n) => ({ ...n, read: readNotificationIds.includes(n.id) }));
  }, [data]);

  const value = useMemo(
    () => ({
      ...data,
      fileUrls,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      recordCounts,
      demoLoaded,
      getProject: (id) => data.projects.find((p) => p.id === id),
      getMember: (id) => data.members.find((m) => m.id === id),
      addProject,
      updateProject,
      deleteProject,
      addTask,
      updateTask,
      toggleTask,
      deleteTask,
      addMember,
      updateMember,
      removeMember,
      addResources,
      deleteResource,
      updatePrefs,
      markNotificationsRead,
      resetWorkspace,
      loadDemoData,
      deleteAllWorkspaceData,
    }),
    [
      data, fileUrls, notifications, addProject, updateProject, deleteProject, addTask, updateTask, toggleTask,
      deleteTask, addMember, updateMember, removeMember, addResources, deleteResource, updatePrefs,
      markNotificationsRead, resetWorkspace, loadDemoData, deleteAllWorkspaceData, recordCounts, demoLoaded,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  return context;
}
