import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, FolderKanban, ListChecks, Menu, Users, X } from 'lucide-react';
import Logo from '../components/common/Logo';
import HeroPreview from '../components/landing/HeroPreview';
import ProductMockup from '../components/landing/ProductMockup';
import '../styles/landing.css';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#about', label: 'About' },
];

const FEATURES = [
  { icon: FolderKanban, title: 'Project Management', text: 'Organize all your academic projects in a single workspace.' },
  { icon: ListChecks, title: 'Smart Task Tracking', text: 'Break projects into manageable tasks and monitor their progress.' },
  { icon: Users, title: 'Team Collaboration', text: 'Keep teammates, responsibilities, and project updates organized.' },
  { icon: CalendarClock, title: 'Deadline Management', text: 'Stay ahead of important submissions with clear deadline visibility.' },
];

const STEPS = [
  { title: 'Create Your Workspace', text: 'Start a project and add its basic details.' },
  { title: 'Organize Your Team', text: 'Add team members and assign responsibilities.' },
  { title: 'Track Your Progress', text: 'Manage tasks and monitor upcoming deadlines.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = 'BuildSphere — Student Project Workspace';
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      <a href="#home" className="skip-link">Skip to content</a>
      <header className={`site-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container site-nav__inner">
          <a href="#home" className="site-nav__brand" aria-label="BuildSphere home">
            <Logo size={30} withText />
          </a>
          <nav aria-label="Primary" className={`site-nav__links ${menuOpen ? 'is-open' : ''}`} id="site-menu">
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
                </li>
              ))}
            </ul>
            <div className="site-nav__mobile-cta">
              <Link to="/login" className="btn btn--secondary btn--md btn--block">Login</Link>
              <Link to="/signup" className="btn btn--primary btn--md btn--block">Get Started</Link>
            </div>
          </nav>
          <div className="site-nav__cta">
            <Link to="/login" className="btn btn--ghost btn--md">Login</Link>
            <Link to="/signup" className="btn btn--primary btn--md">Get Started</Link>
          </div>
          <button
            type="button"
            className="icon-btn site-nav__toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero__inner">
            <div className="hero__copy">
              <span className="hero__badge">BUILT FOR STUDENT TEAMS</span>
              <h1 className="hero__title">Your projects. <span className="hero__title-line">One workspace.</span></h1>
              <p className="hero__text">
                Plan smarter, collaborate better, and keep every academic project on track — all from one place.
              </p>
              <div className="hero__actions">
                <Link to="/signup" className="btn btn--primary btn--lg">Get Started Free</Link>
                <a href="#preview" className="btn btn--secondary btn--lg">Explore Workspace</a>
              </div>
              <p className="hero__trust">Designed for students. Built for collaboration.</p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <h2 className="section__title">Everything your project needs, in one place.</h2>
            <ul className="features">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="feature">
                  <span className="feature__icon"><Icon size={22} aria-hidden="true" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="section section--tinted">
          <div className="container">
            <h2 className="section__title">How it works</h2>
            <p className="section__lead">Three steps from a blank page to a team that knows what’s next.</p>
            <ol className="steps">
              {STEPS.map((step, index) => (
                <li key={step.title} className="step">
                  <span className="step__number" aria-hidden="true">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="preview" className="section">
          <div className="container">
            <h2 className="section__title">From scattered tasks to organized progress.</h2>
            <p className="section__lead">Projects, tasks, deadlines and team updates on one screen, so nobody has to ask “where are we?”.</p>
            <ProductMockup />
          </div>
        </section>

        <section id="about" className="section section--tinted">
          <div className="container about">
            <h2 className="section__title">Built to make student teamwork simpler.</h2>
            <p className="about__text">
              BuildSphere brings project planning, team coordination, task management, and progress tracking together in one easy-to-use workspace.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta">
              <div>
                <h2 className="cta__title">Ready to bring your next project together?</h2>
                <p className="cta__text">Give your academic projects a workspace that keeps everything moving.</p>
              </div>
              <Link to="/signup" className="btn btn--light btn--lg">Create Your Workspace</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__brand">
            <Logo size={28} withText />
            <p>A student project workspace for planning tasks, coordinating teams and tracking deadlines.</p>
          </div>
          <nav aria-label="Footer">
            <ul className="site-footer__links">
              <li><a href="#home">Home</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </nav>
        </div>
        <div className="container site-footer__bottom">
          <p>© {new Date().getFullYear()} BuildSphere. A student project prototype.</p>
        </div>
      </footer>
    </div>
  );
}
