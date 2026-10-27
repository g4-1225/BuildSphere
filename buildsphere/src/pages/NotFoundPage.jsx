import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <Logo size={44} />
      <h1>This page doesn’t exist</h1>
      <p>The link may be old or mistyped.</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--secondary btn--md">Go to home page</Link>
        <Link to="/app" className="btn btn--primary btn--md">Open workspace</Link>
      </div>
    </main>
  );
}
