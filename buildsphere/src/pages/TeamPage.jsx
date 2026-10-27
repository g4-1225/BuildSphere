import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Info, Mail, UserMinus, UserPlus, Users } from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import ProgressBar from '../components/common/ProgressBar';
import ActionMenu from '../components/common/ActionMenu';
import { Avatar } from '../components/common/Avatar';
import MemberFormModal from '../components/forms/MemberFormModal';
import SearchNotice from './SearchNotice';
import PageHeader from './PageHeader';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { matchesQuery, shortName } from '../utils/projectUtils';

export default function TeamPage() {
  const ui = useOutletContext();
  const { members, projects, tasks, removeMember } = useWorkspace();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  const visible = members.filter((m) => matchesQuery([m.name, m.email, m.role], ui.search));

  function requestRemove(member) {
    ui.confirm({
      title: 'Remove this member?',
      message: `${member.name} will be removed from all projects, and their tasks will become unassigned.`,
      confirmLabel: 'Remove member',
      onConfirm: () => {
        removeMember(member.id);
        showToast(`${member.name} removed from the team`);
      },
    });
  }

  return (
    <div className="page">
      <PageHeader
        title="Team"
        text="Who is working on what, and how their tasks are going."
        action={<Button onClick={() => setAdding(true)}><UserPlus size={18} aria-hidden="true" /> Add Member</Button>}
      />
      <SearchNotice ui={ui} count={visible.length} noun="members" />
      <p className="note note--block">
        <Info size={16} aria-hidden="true" />
        Team members are stored in this browser for the demo. Adding someone does not send them an email.
      </p>

      {visible.length === 0 ? (
        <div className="panel">
          <EmptyState icon={Users} title="No team members found" text="Clear the search or add a teammate." />
        </div>
      ) : (
        <ul className="team-grid">
          {visible.map((member) => {
            const memberProjects = projects.filter((p) => p.teamMembers.includes(member.id));
            const memberTasks = tasks.filter((t) => t.assignedTo === member.id);
            const done = memberTasks.filter((t) => t.status === 'completed').length;
            const percent = memberTasks.length ? Math.round((done / memberTasks.length) * 100) : 0;
            return (
              <li key={member.id} className="member-card">
                <div className="member-card__top">
                  <Avatar member={member} size="lg" />
                  <div className="member-card__id">
                    <h3>
                      {member.name}
                      {member.id === 'me' && <span className="muted"> (you)</span>}
                      {member.demo && <span className="member-card__sample">Sample</span>}
                    </h3>
                    <p>{member.role}</p>
                  </div>
                  {member.id !== 'me' && (
                    <ActionMenu
                      label={`Actions for ${member.name}`}
                      items={[{ label: 'Remove from team', icon: UserMinus, danger: true, onClick: () => requestRemove(member) }]}
                    />
                  )}
                </div>
                {member.email && (
                  <p className="member-card__email">
                    <Mail size={14} aria-hidden="true" /> {member.email}
                  </p>
                )}
                <div className="member-card__projects">
                  <span className="member-card__label">Projects</span>
                  {memberProjects.length ? (
                    <ul className="tag-list">
                      {memberProjects.map((p) => (
                        <li key={p.id}>
                          <button type="button" className="tag tag--link" onClick={() => ui.openProject(p.id)}>{shortName(p.name)}</button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="muted small">Not on a project yet</span>
                  )}
                </div>
                <div className="member-card__stats">
                  <div className="member-card__row">
                    <span>{memberTasks.length} task{memberTasks.length === 1 ? '' : 's'} assigned</span>
                    <strong>{done} done</strong>
                  </div>
                  <ProgressBar value={percent} size="sm" label={`${member.name} task completion`} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {adding && <MemberFormModal onClose={() => setAdding(false)} />}
    </div>
  );
}
