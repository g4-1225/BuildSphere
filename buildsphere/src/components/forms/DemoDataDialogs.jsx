import { useMemo, useState } from 'react';
import { DatabaseZap, Info, Trash2, TriangleAlert } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';
import { Field } from '../common/Field';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { getDemoData } from '../../data/mockData';
import { summarizeDemoData } from '../../utils/workspaceData';

// Short pause so the loading state is visible; the work itself is instant.
const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** "4 projects, 15 tasks and 4 team members" from a counts object. */
function describeCounts(counts) {
  const parts = [
    counts.projects && plural(counts.projects, 'project'),
    counts.tasks && plural(counts.tasks, 'task'),
    counts.members && plural(counts.members, 'team member'),
    counts.resources && plural(counts.resources, 'resource'),
    counts.activity && plural(counts.activity, 'activity record'),
    counts.notifications && plural(counts.notifications, 'notification'),
  ].filter(Boolean);
  if (parts.length <= 1) return parts[0] || 'nothing';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function LoadDemoDataDialog({ onClose }) {
  const { user } = useAuth();
  const { demoLoaded, recordCounts, loadDemoData } = useWorkspace();
  const { showToast } = useToast();
  const demoSummary = useMemo(() => summarizeDemoData(getDemoData(user)), [user]);
  const hasUserData = recordCounts.userRecords > 0;

  async function handleConfirm() {
    await pause();
    const result = loadDemoData();
    if (result.status === 'already-loaded') {
      showToast('Demo data is already loaded. Nothing was added.', 'info');
      return;
    }
    showToast(`Demo data loaded: ${describeCounts({ projects: result.added.projects, tasks: result.added.tasks, members: result.added.members })}.`);
  }

  return (
    <ConfirmDialog
      title="Load Demo Data?"
      tone="info"
      icon={DatabaseZap}
      size="md"
      confirmLabel="Load Demo Data"
      confirmDisabled={demoLoaded}
      message="This will populate your BuildSphere workspace with sample projects, tasks, team members, deadlines, and activity records so you can explore the application or demonstrate its features."
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      {demoLoaded ? (
        <p className="note note--block">
          <Info size={16} aria-hidden="true" />
          <span>
            <strong>Demo data is already loaded.</strong> Loading it again would only create duplicates, so nothing will be
            added. To start over with a clean copy, use Delete All Data first, then load the demo data again.
          </span>
        </p>
      ) : hasUserData ? (
        <div className="data-callout data-callout--warning">
          <TriangleAlert size={16} aria-hidden="true" />
          <div>
            <p>Loading demo data may replace or merge with your current workspace data, depending on the selected behavior.</p>
            <p>
              <strong>Here it will merge.</strong> Your {plural(recordCounts.userProjects, 'project')} and{' '}
              {plural(recordCounts.userTasks, 'task')} stay exactly as they are. The sample records are added alongside them
              and marked “Sample”, so nothing of yours is overwritten.
            </p>
          </div>
        </div>
      ) : (
        <p className="note note--block">
          <Info size={16} aria-hidden="true" />
          <span>This adds {describeCounts(demoSummary)}. Deadlines are set relative to today.</span>
        </p>
      )}
    </ConfirmDialog>
  );
}

const CONFIRM_WORD = 'DELETE';

export function DeleteAllDataDialog({ onClose, onDeleted }) {
  const { user } = useAuth();
  const { recordCounts, deleteAllWorkspaceData } = useWorkspace();
  const { showToast } = useToast();
  const [typed, setTyped] = useState('');
  const isEmpty = recordCounts.total === 0;

  async function handleConfirm() {
    await pause();
    deleteAllWorkspaceData();
    onDeleted();
    showToast('Workspace data deleted successfully.');
  }

  return (
    <ConfirmDialog
      title="Delete All Data?"
      tone="danger"
      icon={Trash2}
      size="md"
      confirmLabel="Delete All Data"
      confirmDisabled={isEmpty || typed.trim() !== CONFIRM_WORD}
      message={
        <div className="confirm__message">
          <p>This action will permanently clear the selected BuildSphere workspace data stored by this application. This cannot be undone.</p>
          <p className="confirm__secondary">
            Your projects, tasks, and other saved workspace records may be removed. Your account and login session will remain
            active unless you explicitly choose otherwise.
          </p>
        </div>
      }
      onConfirm={handleConfirm}
      onClose={onClose}
    >
      {isEmpty ? (
        <p className="note note--block">
          <Info size={16} aria-hidden="true" />
          <span>Your workspace is already empty. There is nothing to delete.</span>
        </p>
      ) : (
        <>
          <dl className="data-scope">
            <div>
              <dt>Will be removed</dt>
              <dd>{describeCounts(recordCounts)}.</dd>
            </div>
            <div>
              <dt>Will be kept</dt>
              <dd>Your account, login session, profile, and theme and notification settings.</dd>
            </div>
          </dl>
          <p className="muted small">
            Only the workspace for {user.email} in this browser is affected. BuildSphere doesn’t store anything on a server,
            so there is no online copy to delete.
          </p>
          <Field
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            data-autofocus
          />
        </>
      )}
    </ConfirmDialog>
  );
}
