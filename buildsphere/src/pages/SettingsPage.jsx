import { useEffect, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import Button from '../components/common/Button';
import { Field } from '../components/common/Field';
import { Avatar } from '../components/common/Avatar';
import PageHeader from './PageHeader';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { getInitials } from '../utils/projectUtils';

const THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'Match device', icon: Monitor },
];

const NOTIFICATION_PREFS = [
  { id: 'deadlineReminders', label: 'Deadline reminders', text: 'Tasks due within two days, and anything overdue.' },
  { id: 'taskUpdates', label: 'Task updates', text: 'When tasks are completed or assigned to you.' },
  { id: 'teamActivity', label: 'Team changes', text: 'When teammates change deadlines or project details.' },
];

export default function SettingsPage() {
  const ui = useOutletContext();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const { members, prefs, updatePrefs, updateMember, resetWorkspace } = useWorkspace();
  const { showToast } = useToast();
  const me = members.find((m) => m.id === 'me');

  const [profile, setProfile] = useState({ name: me?.name || '', college: user.college || '', role: me?.role || '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.hash === '#profile') document.getElementById('profile')?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  function saveProfile(event) {
    event.preventDefault();
    const found = {};
    if (profile.name.trim().length < 2) found.name = 'Enter a display name of at least 2 characters.';
    if (!profile.role.trim()) found.role = 'Enter your role, for example “Project Lead”.';
    setErrors(found);
    if (Object.keys(found).length) return;
    updateUser({ name: profile.name.trim(), college: profile.college.trim() });
    updateMember('me', { name: profile.name.trim(), role: profile.role.trim() });
    showToast('Profile saved');
  }

  function setPref(key, value, message) {
    updatePrefs({ [key]: value });
    showToast(message, 'info');
  }

  return (
    <div className="page page--narrow">
      <PageHeader title="Settings" text="Your profile and how this demo workspace behaves. Saved in this browser." />

      <section id="profile" className="panel settings-section" aria-labelledby="profile-heading">
        <div className="settings-section__intro">
          <h3 id="profile-heading" className="panel__title">Profile</h3>
          <p className="muted small">Shown on tasks, the team page and the greeting.</p>
        </div>
        <form className="settings-form" onSubmit={saveProfile} noValidate>
          <div className="profile-preview">
            <Avatar member={{ ...me, name: profile.name || me?.name, initials: getInitials(profile.name || me?.name) }} size="lg" />
            <div>
              <strong>{profile.name || 'Your name'}</strong>
              <span className="muted small">{user.email}</span>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Display name" required value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} error={errors.name} />
            <Field label="Role" required value={profile.role} onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))} error={errors.role} />
            <Field label="Email" value={user.email} readOnly disabled hint="Email is your demo sign-in and can’t be changed." />
            <Field label="College or university" value={profile.college} onChange={(e) => setProfile((p) => ({ ...p, college: e.target.value }))} placeholder="Optional" />
          </div>
          <div className="settings-form__actions">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </section>

      <section className="panel settings-section" aria-labelledby="appearance-heading">
        <div className="settings-section__intro">
          <h3 id="appearance-heading" className="panel__title">Appearance</h3>
          <p className="muted small">Applies to the workspace on this device.</p>
        </div>
        <div className="theme-options" role="radiogroup" aria-labelledby="appearance-heading">
          {THEMES.map(({ id, label, icon: Icon }) => (
            <label key={id} className={`theme-option ${prefs.theme === id ? 'is-active' : ''}`}>
              <input type="radio" name="theme" className="sr-only" checked={prefs.theme === id} onChange={() => setPref('theme', id, `Theme set to ${label.toLowerCase()}`)} />
              <span className={`theme-option__swatch theme-option__swatch--${id}`} aria-hidden="true" />
              <span className="theme-option__label"><Icon size={16} aria-hidden="true" /> {label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="panel settings-section" aria-labelledby="notif-heading">
        <div className="settings-section__intro">
          <h3 id="notif-heading" className="panel__title">Notifications</h3>
          <p className="muted small">Controls what appears in the bell menu.</p>
        </div>
        <ul className="pref-list">
          {NOTIFICATION_PREFS.map((pref) => (
            <li key={pref.id}>
              <div>
                <p className="pref-list__label" id={`${pref.id}-label`}>{pref.label}</p>
                <p className="muted small">{pref.text}</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  aria-labelledby={`${pref.id}-label`}
                  checked={prefs[pref.id]}
                  onChange={(e) => setPref(pref.id, e.target.checked, `${pref.label} turned ${e.target.checked ? 'on' : 'off'}`)}
                />
                <span className="switch__track" aria-hidden="true" />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel settings-section" aria-labelledby="data-heading">
        <div className="settings-section__intro">
          <h3 id="data-heading" className="panel__title">Demo data</h3>
          <p className="muted small">
            Your session is a demo session stored in {user.remember ? 'localStorage, so it stays after closing the browser' : 'sessionStorage, so it ends when this tab closes'}.
          </p>
        </div>
        <div className="danger-row">
          <div>
            <p className="pref-list__label">Reset workspace</p>
            <p className="muted small">Replace all projects, tasks, team and resources with a fresh copy of the sample data. To only add or only clear data, use Load Demo Data or Delete All Data in the profile menu.</p>
          </div>
          <Button
            variant="danger"
            onClick={() =>
              ui.confirm({
                title: 'Reset the demo workspace?',
                message: 'All your changes to projects, tasks, team and resources will be replaced with sample data.',
                confirmLabel: 'Reset workspace',
                onConfirm: () => {
                  resetWorkspace(); // throws if storage is unavailable; the dialog shows the error
                  showToast('Workspace reset to sample data');
                },
              })
            }
          >
            <RotateCcw size={16} aria-hidden="true" /> Reset
          </Button>
        </div>
      </section>
    </div>
  );
}
