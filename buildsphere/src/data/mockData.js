import { addDays, startOfToday, toISODate } from '../utils/dateUtils';
import { getInitials } from '../utils/projectUtils';

/*
 * Central source of BuildSphere's sample ("demo") data.
 *
 * Every demo record has:
 *   - an id starting with "demo-" (user-created ids come from uid() and look
 *     like "project_lz3k9a_x81f", so the two can never collide), and
 *   - demo: true, which is how the app recognises sample records.
 *
 * The logged-in user is always the member with id "me" and is never part of
 * the demo set; demo projects and tasks simply reference "me".
 */

// v2 added the demo marker. v1 saves are migrated in utils/workspaceData.js.
export const DATA_VERSION = 2;

export const DEFAULT_PREFS = {
  theme: 'light',
  deadlineReminders: true,
  taskUpdates: true,
  teamActivity: true,
};

export const DEMO_ID_PREFIX = 'demo-';

/** The member record that represents the signed-in user. */
export function createMeMember(user) {
  const name = user?.name || 'Alex Rivera';
  return { id: 'me', name, email: user?.email || '', role: 'Project Lead', initials: getInitials(name) };
}

/**
 * Builds the demo dataset. Dates are relative to today so deadlines always
 * look current, and timestamps are relative to now.
 */
export function getDemoData(user) {
  const today = startOfToday();
  const day = (offset) => toISODate(addDays(today, offset));
  const now = Date.now();
  const minutesAgo = (m) => now - m * 60 * 1000;

  let members = [
    { id: 'demo-m1', name: 'Priya Sharma', email: 'priya@example.com', role: 'Frontend Developer' },
    { id: 'demo-m2', name: 'Daniel Okafor', email: 'daniel@example.com', role: 'Backend Developer' },
    { id: 'demo-m3', name: 'Mei Lin', email: 'mei@example.com', role: 'UI/UX Designer' },
    { id: 'demo-m4', name: 'Arjun Mehta', email: 'arjun@example.com', role: 'Data Analyst' },
  ].map((m) => ({ ...m, initials: getInitials(m.name), demo: true }));

  const projects = [
    {
      id: 'demo-p1',
      name: 'BuildSphere — Student Project Workspace',
      description: 'A shared workspace where student teams plan tasks, keep resources together and track deadlines.',
      category: 'Web Development',
      tags: ['React', 'CSS'],
      startDate: day(-42),
      dueDate: day(18),
      status: 'in-progress',
      teamMembers: ['me', 'demo-m1', 'demo-m3'],
      createdAt: minutesAgo(60 * 24 * 42),
    },
    {
      id: 'demo-p2',
      name: 'CampusConnect — Campus Community Platform',
      description: 'A single place for club events, notices and student discussions across campus.',
      category: 'Mobile App',
      tags: ['Flutter', 'Firebase'],
      startDate: day(-30),
      dueDate: day(32),
      status: 'in-progress',
      teamMembers: ['me', 'demo-m2', 'demo-m4'],
      createdAt: minutesAgo(60 * 24 * 30),
    },
    {
      id: 'demo-p3',
      name: 'EcoTrack — Sustainability Tracking Application',
      description: 'Tracks hostel energy and water use and turns the numbers into weekly savings goals.',
      category: 'Data Science',
      tags: ['Python', 'Pandas'],
      startDate: day(-20),
      dueDate: day(55),
      status: 'on-hold',
      teamMembers: ['demo-m3', 'demo-m4'],
      createdAt: minutesAgo(60 * 24 * 20),
    },
    {
      id: 'demo-p4',
      name: 'StudySync — Collaborative Study Planner',
      description: 'Shared study timetables, revision goals and group session scheduling for exam season.',
      category: 'Web Development',
      tags: ['React', 'Node.js'],
      startDate: day(-95),
      dueDate: day(-10),
      status: 'completed',
      teamMembers: ['me', 'demo-m1', 'demo-m2'],
      createdAt: minutesAgo(60 * 24 * 95),
    },
  ].map((p) => ({ ...p, demo: true }));

  // [id, title, project, assignee, priority, status, due offset (days), description]
  const taskRows = [
    ['t1', 'Design the landing page', 'p1', 'me', 'high', 'completed', -9, 'Hero, features and call-to-action sections.'],
    ['t2', 'Implement the login form', 'p1', 'demo-m1', 'medium', 'completed', -5, 'Validation, password toggle and demo sign-in.'],
    ['t3', 'Create dashboard components', 'p1', 'demo-m1', 'high', 'in-progress', 2, 'Stat cards, project cards and the task panel.'],
    ['t4', 'Test responsive layouts', 'p1', 'demo-m3', 'medium', 'todo', 5, 'Check every page at phone, tablet and laptop widths.'],
    ['t5', 'Prepare project documentation', 'p1', 'me', 'medium', 'todo', 8, 'Setup guide, feature list and architecture overview.'],
    ['t6', 'Finalize the project presentation', 'p1', 'me', 'high', 'todo', 16, 'Slides and live demo script for the final review.'],
    ['t7', 'Review the database schema', 'p2', 'demo-m2', 'high', 'in-progress', 1, 'Check the events and clubs collections before API work starts.'],
    ['t8', 'Create event feed wireframes', 'p2', 'me', 'medium', 'completed', -4, ''],
    ['t9', 'Implement the club directory', 'p2', 'demo-m2', 'medium', 'todo', 11, ''],
    ['t10', 'Draft the privacy notice', 'p2', 'demo-m4', 'low', 'todo', -1, 'Explain what student data the app stores.'],
    ['t11', 'Collect hostel energy readings', 'p3', 'demo-m4', 'medium', 'completed', -15, ''],
    ['t12', 'Build carbon footprint charts', 'p3', 'demo-m3', 'medium', 'todo', 25, ''],
    ['t13', 'Review team feedback', 'p4', 'me', 'medium', 'completed', -14, 'Collect comments from the mid-semester review.'],
    ['t14', 'Submit the final report', 'p4', 'me', 'high', 'completed', -10, ''],
    ['t15', 'Record the demo video', 'p4', 'demo-m2', 'low', 'completed', -12, ''],
  ];
  const tasks = taskRows.map(([id, title, projectId, assignedTo, priority, status, dueOffset, description], index) => ({
    id: `demo-${id}`,
    title,
    description,
    projectId: `demo-${projectId}`,
    assignedTo,
    priority,
    status,
    dueDate: day(dueOffset),
    createdAt: minutesAgo(60 * 24 * 12 - index * 45),
    demo: true,
  }));

  // File details only: no real file is attached, so the UI shows "Sample, no file".
  const resources = [
    { id: 'demo-r1', title: 'Project proposal.pdf', type: 'PDF', projectId: 'demo-p1', uploadedAt: day(-40), size: 482000 },
    { id: 'demo-r2', title: 'UI style guide.pdf', type: 'PDF', projectId: 'demo-p1', uploadedAt: day(-21), size: 3400000 },
    { id: 'demo-r3', title: 'Database schema.png', type: 'Image', projectId: 'demo-p2', uploadedAt: day(-9), size: 214000 },
    { id: 'demo-r4', title: 'Survey responses.csv', type: 'Spreadsheet', projectId: 'demo-p3', uploadedAt: day(-16), size: 96000 },
    { id: 'demo-r5', title: 'Final report.docx', type: 'Document', projectId: 'demo-p4', uploadedAt: day(-10), size: 1250000 },
  ].map((r) => ({ ...r, demo: true }));

  const activity = [
    { id: 'demo-a1', actorId: 'demo-m1', action: 'marked complete', target: 'Implement the login form', project: 'BuildSphere', at: minutesAgo(38) },
    { id: 'demo-a2', actorId: 'demo-m2', action: 'moved to In Progress', target: 'Review the database schema', project: 'CampusConnect', at: minutesAgo(140) },
    { id: 'demo-a3', actorId: 'demo-m3', action: 'updated the deadline for', target: 'Test responsive layouts', project: 'BuildSphere', at: minutesAgo(60 * 6) },
    { id: 'demo-a4', actorId: 'me', action: 'assigned a task to Arjun:', target: 'Draft the privacy notice', project: 'CampusConnect', at: minutesAgo(60 * 22) },
    { id: 'demo-a5', actorId: 'me', action: 'created the project', target: 'EcoTrack', project: '', at: minutesAgo(60 * 24 * 20) },
    { id: 'demo-a6', actorId: 'demo-m2', action: 'marked complete', target: 'Record the demo video', project: 'StudySync', at: minutesAgo(60 * 24 * 12) },
  ].map((a) => ({ ...a, demo: true }));

  const notifications = [
    { id: 'demo-n1', type: 'task', title: 'Priya completed “Implement the login form”', body: 'BuildSphere', at: minutesAgo(38) },
    { id: 'demo-n2', type: 'team', title: 'Mei Lin changed a deadline', body: 'Test responsive layouts, BuildSphere', at: minutesAgo(60 * 6) },
    { id: 'demo-n3', type: 'task', title: 'You were assigned “Prepare project documentation”', body: 'BuildSphere', at: minutesAgo(60 * 26) },
  ].map((n) => ({ ...n, demo: true }));

  // If the signed-in user's email matches a demo teammate, use "me" instead so the
  // same person never appears twice.
  const myEmail = user?.email?.toLowerCase();
  const clash = members.find((m) => m.email === myEmail);
  if (clash) {
    const swap = (id) => (id === clash.id ? 'me' : id);
    members = members.filter((m) => m.id !== clash.id);
    projects.forEach((p) => { p.teamMembers = [...new Set(p.teamMembers.map(swap))]; });
    tasks.forEach((t) => { t.assignedTo = swap(t.assignedTo); });
    activity.forEach((a) => { a.actorId = swap(a.actorId); });
  }

  return { members, projects, tasks, resources, activity, notifications };
}

/** A workspace with no records except the signed-in user. */
export function createEmptyWorkspace(user, prefs = DEFAULT_PREFS) {
  return {
    version: DATA_VERSION,
    members: [createMeMember(user)],
    projects: [],
    tasks: [],
    resources: [],
    activity: [],
    storedNotifications: [],
    readNotificationIds: [],
    prefs: { ...DEFAULT_PREFS, ...prefs },
  };
}
