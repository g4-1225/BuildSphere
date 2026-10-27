import { daysUntil } from './dateUtils';

export const PROJECT_STATUS = {
  'in-progress': 'In Progress',
  completed: 'Completed',
  'on-hold': 'On Hold',
};

export const TASK_STATUS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High' };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Data Science',
  'AI / ML',
  'IoT & Hardware',
  'Research',
  'Design',
  'Other',
];

/** Unique id such as "task_lz3k9a_x81f". */
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** "BuildSphere — Student Project Workspace" → { title: "BuildSphere", subtitle: "Student Project Workspace" } */
export function splitProjectName(name = '') {
  const [title, ...rest] = name.split(' — ');
  return { title: title.trim(), subtitle: rest.join(' — ').trim() };
}

export function shortName(name = '') {
  return splitProjectName(name).title;
}

export function getProjectTasks(projectId, tasks) {
  return tasks.filter((task) => task.projectId === projectId);
}

/** Progress is derived from tasks so it always matches the task list. */
export function calculateProgress(project, tasks) {
  const projectTasks = getProjectTasks(project.id, tasks);
  if (projectTasks.length === 0) return project.status === 'completed' ? 100 : 0;
  const done = projectTasks.filter((task) => task.status === 'completed').length;
  return Math.round((done / projectTasks.length) * 100);
}

export function countTasksByStatus(tasks) {
  return tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    },
    { todo: 0, 'in-progress': 0, completed: 0 }
  );
}

/**
 * Collects open task and project deadlines, sorted soonest first.
 * Overdue items (up to 30 days late) are included so they don't silently disappear.
 */
export function getUpcomingDeadlines(projects, tasks, withinDays = 14) {
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  const items = [];

  tasks.forEach((task) => {
    if (task.status === 'completed' || !task.dueDate) return;
    const days = daysUntil(task.dueDate);
    if (days < -30 || days > withinDays) return;
    const project = projectById[task.projectId];
    items.push({
      id: `task-${task.id}`,
      kind: 'task',
      refId: task.id,
      title: task.title,
      projectId: task.projectId,
      projectName: project ? shortName(project.name) : 'No project',
      dueDate: task.dueDate,
      priority: task.priority,
      days,
    });
  });

  projects.forEach((project) => {
    if (project.status === 'completed' || !project.dueDate) return;
    const days = daysUntil(project.dueDate);
    if (days < -30 || days > withinDays) return;
    items.push({
      id: `project-${project.id}`,
      kind: 'project',
      refId: project.id,
      title: 'Final submission',
      projectId: project.id,
      projectName: shortName(project.name),
      dueDate: project.dueDate,
      priority: 'high',
      days,
    });
  });

  return items.sort((a, b) => a.days - b.days);
}

export function computeStats(projects, tasks) {
  const counts = countTasksByStatus(tasks);
  const deadlines = getUpcomingDeadlines(projects, tasks, 14);
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === 'in-progress').length,
    onHoldProjects: projects.filter((p) => p.status === 'on-hold').length,
    totalTasks: tasks.length,
    completedTasks: counts.completed,
    inProgressTasks: counts['in-progress'],
    todoTasks: counts.todo,
    pendingTasks: tasks.length - counts.completed,
    upcomingDeadlines: deadlines.filter((d) => d.days >= 0).length,
    overdue: deadlines.filter((d) => d.days < 0).length,
  };
}

export function matchesQuery(values, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((value) => String(value ?? '').toLowerCase().includes(q));
}

export function filterProjects(projects, { query = '', status = 'all' } = {}) {
  return projects.filter(
    (project) =>
      (status === 'all' || project.status === status) &&
      matchesQuery([project.name, project.description, project.category, ...(project.tags || [])], query)
  );
}

export function filterTasks(tasks, projects, { query = '', status = 'all', priority = 'all', projectId = 'all' } = {}) {
  const projectById = Object.fromEntries(projects.map((p) => [p.id, p]));
  return tasks.filter(
    (task) =>
      (status === 'all' || task.status === status) &&
      (priority === 'all' || task.priority === priority) &&
      (projectId === 'all' || task.projectId === projectId) &&
      matchesQuery([task.title, task.description, projectById[task.projectId]?.name], query)
  );
}

export function sortTasks(tasks, sortBy = 'due') {
  const list = [...tasks];
  if (sortBy === 'priority') {
    return list.sort(
      (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.dueDate || '').localeCompare(b.dueDate || '')
    );
  }
  if (sortBy === 'newest') return list.sort((a, b) => b.createdAt - a.createdAt);
  // Default: open tasks first, then by due date.
  return list.sort((a, b) => {
    const doneA = a.status === 'completed' ? 1 : 0;
    const doneB = b.status === 'completed' ? 1 : 0;
    return doneA - doneB || (a.dueDate || '').localeCompare(b.dueDate || '');
  });
}

export function formatFileSize(bytes) {
  if (bytes == null) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_TYPES = {
  PDF: ['pdf'],
  Document: ['doc', 'docx', 'txt', 'md', 'rtf', 'odt'],
  Slides: ['ppt', 'pptx', 'key', 'odp'],
  Spreadsheet: ['xls', 'xlsx', 'csv', 'ods'],
  Image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'],
  Code: ['js', 'jsx', 'ts', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'ipynb', 'sql'],
  Archive: ['zip', 'rar', '7z', 'tar', 'gz'],
};

export function getFileType(fileName = '') {
  const ext = fileName.split('.').pop().toLowerCase();
  const match = Object.entries(FILE_TYPES).find(([, exts]) => exts.includes(ext));
  return match ? match[0] : 'Other';
}
