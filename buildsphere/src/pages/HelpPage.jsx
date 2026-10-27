import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import PageHeader from './PageHeader';

const FAQS = [
  {
    q: 'How is project progress calculated?',
    a: 'Progress is the share of a project’s tasks that are marked complete. Tick or untick a task and the project card, statistics and team view update straight away.',
  },
  {
    q: 'Where is my data saved?',
    a: 'Everything is saved in your browser’s localStorage for this demo. Nothing is sent to a server, so your workspace is only on this device and browser.',
  },
  {
    q: 'Can I invite real teammates?',
    a: 'Not in this prototype. “Add Member” adds a person to your local workspace so you can assign tasks, but no invitation email is sent.',
  },
  {
    q: 'What happens to files I add in Resources?',
    a: 'They stay in the current browser tab so you can open or download them. After a refresh only the file name, size and project are kept.',
  },
  {
    q: 'How do I load or clear sample data?',
    a: 'Open the profile menu in the top bar. “Load Demo Data” adds sample projects, tasks and teammates without touching your own records, and “Delete All Data” clears your workspace while keeping you signed in. Settings → “Reset workspace” does both in one step.',
  },
  {
    q: 'Is the login secure?',
    a: 'No. This is a frontend-only demo. Passwords are hashed before being saved locally, but there is no real authentication or account protection.',
  },
];

export default function HelpPage() {
  return (
    <div className="page page--narrow">
      <PageHeader title="Help & Support" text="Answers to common questions about this workspace." />
      <p className="note note--block">
        <Info size={16} aria-hidden="true" />
        BuildSphere is a frontend prototype. There is no support team or help desk behind this page.
      </p>
      <section className="panel faq" aria-label="Frequently asked questions">
        {FAQS.map((item) => (
          <details key={item.q} className="faq__item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
      <p className="muted small">
        Looking for your preferences? <Link to="/app/settings" className="link-btn">Open Settings</Link>
      </p>
    </div>
  );
}
