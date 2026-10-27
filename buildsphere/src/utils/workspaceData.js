import { createEmptyWorkspace, createMeMember, DATA_VERSION, DEFAULT_PREFS, getDemoData } from '../data/mockData';

/*
 * Pure functions for whole-workspace operations. They never touch React state
 * or storage; WorkspaceContext decides when to save and apply the result.
 */

const MAX_ACTIVITY = 30;

/** Lists in the workspace object that hold records. */
const RECORD_LISTS = ['projects', 'tasks', 'members', 'resources', 'activity', 'storedNotifications'];

export const isDemoRecord = (record) => record?.demo === true;

/** True when any sample record is present, so loading again would duplicate it. */
export function isDemoDataLoaded(workspace) {
  return RECORD_LISTS.some((list) => workspace[list].some(isDemoRecord));
}

/** Record counts used by the confirmation dialogs. The signed-in user ("me") is not counted. */
export function countWorkspaceRecords(workspace) {
  const members = workspace.members.filter((m) => m.id !== 'me');
  const counts = {
    projects: workspace.projects.length,
    tasks: workspace.tasks.length,
    members: members.length,
    resources: workspace.resources.length,
    activity: workspace.activity.length,
    notifications: workspace.storedNotifications.length,
  };
  counts.total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  counts.userRecords =
    workspace.projects.filter((r) => !isDemoRecord(r)).length +
    workspace.tasks.filter((r) => !isDemoRecord(r)).length +
    members.filter((r) => !isDemoRecord(r)).length +
    workspace.resources.filter((r) => !isDemoRecord(r)).length;
  counts.userProjects = workspace.projects.filter((r) => !isDemoRecord(r)).length;
  counts.userTasks = workspace.tasks.filter((r) => !isDemoRecord(r)).length;
  return counts;
}

/** Summary of what a demo load adds, e.g. for the confirmation message. */
export function summarizeDemoData(demo) {
  return {
    projects: demo.projects.length,
    tasks: demo.tasks.length,
    members: demo.members.length,
    resources: demo.resources.length,
    activity: demo.activity.length,
    notifications: demo.notifications.length,
  };
}

/** Adds items whose id isn't already in the list (never replaces existing records). */
function addMissing(list, items) {
  const ids = new Set(list.map((r) => r.id));
  return [...list, ...items.filter((r) => !ids.has(r.id))];
}

const newestFirst = (a, b) => (b.at || 0) - (a.at || 0);

/**
 * Merges demo records into a workspace. Existing records are kept as they are;
 * demo ids are namespaced ("demo-…") so they never clash with user records.
 */
export function mergeDemoData(workspace, demo) {
  return {
    ...workspace,
    projects: addMissing(workspace.projects, demo.projects),
    tasks: addMissing(workspace.tasks, demo.tasks),
    members: addMissing(workspace.members, demo.members),
    resources: addMissing(workspace.resources, demo.resources),
    activity: addMissing(workspace.activity, demo.activity).sort(newestFirst).slice(0, MAX_ACTIVITY),
    storedNotifications: addMissing(workspace.storedNotifications, demo.notifications).sort(newestFirst),
  };
}

/**
 * Removes every workspace record while keeping the signed-in user's own member
 * record and preferences. Any other fields on the object are left untouched.
 */
export function clearWorkspaceData(workspace) {
  return {
    ...workspace,
    projects: [],
    tasks: [],
    members: workspace.members.filter((m) => m.id === 'me'),
    resources: [],
    activity: [],
    storedNotifications: [],
    readNotificationIds: [],
  };
}

/** The workspace a brand-new account starts with: the demo data. */
export function createSeedWorkspace(user, prefs) {
  return mergeDemoData(createEmptyWorkspace(user, prefs), getDemoData(user));
}

// Ids used by the version 1 seed, before demo records were marked.
const LEGACY_SEED_ID = /^(p[1-4]|t([1-9]|1[0-4])|m[2-5]|r[1-5]|a[1-5]|n[1-3])$/;

const asList = (value) => (Array.isArray(value) ? value.filter((r) => r && typeof r === 'object' && r.id) : []);

/**
 * Turns whatever was saved into a valid workspace, or returns null when the
 * saved value isn't a BuildSphere workspace (missing or unreadable).
 * Malformed lists become empty lists instead of crashing the app.
 */
export function normalizeWorkspace(saved, user) {
  if (!saved || typeof saved !== 'object' || ![1, DATA_VERSION].includes(saved.version)) return null;

  const workspace = {
    ...saved,
    version: DATA_VERSION,
    projects: asList(saved.projects).map((p) => ({
      ...p,
      teamMembers: Array.isArray(p.teamMembers) ? p.teamMembers : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
    })),
    tasks: asList(saved.tasks),
    members: asList(saved.members),
    resources: asList(saved.resources),
    activity: asList(saved.activity),
    storedNotifications: asList(saved.storedNotifications),
    readNotificationIds: Array.isArray(saved.readNotificationIds) ? saved.readNotificationIds : [],
    prefs: { ...DEFAULT_PREFS, ...(saved.prefs && typeof saved.prefs === 'object' ? saved.prefs : {}) },
  };

  // Version 1 saves: mark the original seed records as demo data so that
  // "Load Demo Data" recognises them and doesn't add a second copy.
  if (saved.version === 1) {
    RECORD_LISTS.forEach((list) => {
      workspace[list] = workspace[list].map((r) => (LEGACY_SEED_ID.test(r.id) ? { ...r, demo: true } : r));
    });
  }

  if (!workspace.members.some((m) => m.id === 'me')) {
    workspace.members = [createMeMember(user), ...workspace.members];
  }
  return workspace;
}
