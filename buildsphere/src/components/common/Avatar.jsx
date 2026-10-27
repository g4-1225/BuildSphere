// Avatar colours are chosen from the name so a person always gets the same colour.
const PALETTE = ['violet', 'teal', 'amber', 'rose', 'sky', 'slate'];

function colourFor(name = '') {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

export function Avatar({ member, size = 'md', showTitle = true }) {
  if (!member) return null;
  return (
    <span className={`avatar avatar--${size} avatar--${colourFor(member.name)}`} title={showTitle ? member.name : undefined}>
      <span aria-hidden="true">{member.initials}</span>
      <span className="sr-only">{member.name}</span>
    </span>
  );
}

export function AvatarStack({ members = [], max = 3, size = 'sm' }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  if (members.length === 0) return <span className="muted small">No members yet</span>;
  return (
    <span className="avatar-stack" aria-label={`Team: ${members.map((m) => m.name).join(', ')}`}>
      {shown.map((member) => (
        <Avatar key={member.id} member={member} size={size} />
      ))}
      {extra > 0 && (
        <span className={`avatar avatar--${size} avatar--more`} aria-hidden="true">
          +{extra}
        </span>
      )}
    </span>
  );
}
