import { History } from 'lucide-react';
import Panel from '../common/Panel';
import EmptyState from '../common/EmptyState';
import { Avatar } from '../common/Avatar';
import { useWorkspace } from '../../context/WorkspaceContext';
import { timeAgo } from '../../utils/dateUtils';

export default function ActivityPanel({ limit = 6 }) {
  const { activity, getMember } = useWorkspace();
  const items = activity.slice(0, limit);
  const hasSample = items.some((item) => item.demo);

  return (
    <Panel
      title="Recent Activity"
      subtitle={hasSample ? 'Includes sample activity from the demo team' : 'Changes made in this workspace'}
      className="activity-panel"
    >
      {items.length === 0 ? (
        <EmptyState compact icon={History} title="No recent activity" text="Updates appear here as you and your team create and complete work." />
      ) : (
        <ol className="activity">
          {items.map((item) => {
            const actor = getMember(item.actorId) || { name: 'Former member', initials: '?', id: 'x' };
            return (
              <li key={item.id} className="activity__item">
                <Avatar member={actor} size="sm" />
                <div>
                  <p className="activity__text">
                    <strong>{item.actorId === 'me' ? 'You' : actor.name}</strong> {item.action}{' '}
                    <strong>{item.target}</strong>
                    {item.project && <span className="muted"> in {item.project}</span>}
                  </p>
                  <time className="activity__time" dateTime={new Date(item.at).toISOString()}>
                    {timeAgo(item.at)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
