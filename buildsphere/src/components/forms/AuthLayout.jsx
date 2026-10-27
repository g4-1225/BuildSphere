import { Link } from 'react-router-dom';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import Logo from '../common/Logo';
import '../../styles/auth.css';

/** Shared split-screen layout for the login and sign-up pages. */
export default function AuthLayout({ heading, text, children }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <Link to="/" className="auth__brand" aria-label="BuildSphere home">
          <Logo size={32} withText />
        </Link>
        <div className="auth__pitch">
          <h2>{heading}</h2>
          <p>{text}</p>
        </div>

        <div className="auth__art" aria-hidden="true">
          <div className="auth-card auth-card--project">
            <div className="auth-card__row">
              <strong>BuildSphere</strong>
              <span className="auth-card__pill">In Progress</span>
            </div>
            <span className="auth-card__muted">6 tasks, 3 teammates</span>
            <div className="auth-card__bar"><span style={{ width: '68%' }} /></div>
            <div className="auth-card__row auth-card__row--foot">
              <span className="auth-card__avatars"><i>AR</i><i>PS</i><i>ML</i></span>
              <span className="auth-card__muted">68%</span>
            </div>
          </div>
          <div className="auth-card auth-card--task">
            <CheckCircle2 size={18} />
            <span>Design the login page</span>
          </div>
          <div className="auth-card auth-card--deadline">
            <CalendarClock size={18} />
            <span><strong>Final review</strong> in 6 days</span>
          </div>
        </div>

        <p className="auth__tagline">Plan smarter. Collaborate better.</p>
      </aside>

      <main className="auth__main">
        <div className="auth__mobile-brand">
          <Link to="/" aria-label="BuildSphere home"><Logo size={30} withText /></Link>
        </div>
        <div className="auth__form-wrap">{children}</div>
      </main>
    </div>
  );
}
