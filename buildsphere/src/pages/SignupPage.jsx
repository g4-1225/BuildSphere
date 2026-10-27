import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, TriangleAlert } from 'lucide-react';
import AuthLayout from '../components/forms/AuthLayout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Field, PasswordField } from '../components/common/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export function passwordStrength(password) {
  if (password.length < MIN_PASSWORD) return 0;
  let score = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
  return Math.min(score, 4);
}

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name.';
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@college.edu.';
  if (values.password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`;
  if (!values.confirm) errors.confirm = 'Re-enter your password.';
  else if (values.confirm !== values.password) errors.confirm = 'Passwords don’t match.';
  if (!values.terms) errors.terms = 'Accept the demo terms to create your workspace.';
  return errors;
}

export default function SignupPage() {
  const { register, startSession } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState({ name: '', email: '', college: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    document.title = 'Sign up — BuildSphere';
  }, []);

  const strength = passwordStrength(values.password);

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      event.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    setStatus('loading');
    try {
      const account = await register(values);
      setStatus('success');
      // Show the success message briefly, then open the workspace.
      setTimeout(() => {
        showToast(`Welcome to BuildSphere, ${account.name.split(' ')[0]}!`);
        startSession(account, false);
      }, 1100);
    } catch (error) {
      setFormError(error.message);
      setStatus('idle');
    }
  }

  return (
    <AuthLayout heading="Every project, organized from day one" text="Create a workspace for your team, add tasks and see deadlines before they sneak up.">
      <div className="auth-form">
        <h1 className="auth-form__title">Create your workspace</h1>
        <p className="auth-form__subtitle">Start organizing your academic projects today.</p>

        {status === 'success' ? (
          <div className="form-success" role="status">
            <CheckCircle2 size={28} aria-hidden="true" />
            <h2>Account created</h2>
            <p>Opening your workspace…</p>
          </div>
        ) : (
          <>
            {formError && (
              <div className="form-alert" role="alert">
                <TriangleAlert size={18} aria-hidden="true" />
                <span>
                  {formError} {formError.includes('Log in') && <Link to="/login">Go to login</Link>}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="form-stack">
              <Field label="Full name" required autoComplete="name" value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} />
              <Field label="College email or email address" type="email" required autoComplete="email" value={values.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} placeholder="you@college.edu" />
              <Field label="College or university" autoComplete="organization" value={values.college} onChange={(e) => setField('college', e.target.value)} placeholder="Optional" />
              <PasswordField
                required
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                error={errors.password}
                hint={!errors.password ? `At least ${MIN_PASSWORD} characters. Mix in capitals, numbers or symbols.` : undefined}
              >
                {values.password && (
                  <div className={`strength strength--${strength}`} aria-live="polite">
                    <span className="strength__bars" aria-hidden="true"><i /><i /><i /><i /></span>
                    <span className="strength__label">Password strength: {STRENGTH_LABELS[strength]}</span>
                  </div>
                )}
              </PasswordField>
              <PasswordField label="Confirm password" required autoComplete="new-password" value={values.confirm} onChange={(e) => setField('confirm', e.target.value)} error={errors.confirm} />

              <div className={`field ${errors.terms ? 'field--error' : ''}`}>
                <label className="check" htmlFor="terms">
                  <input
                    id="terms"
                    type="checkbox"
                    className="checkbox"
                    checked={values.terms}
                    onChange={(e) => setField('terms', e.target.checked)}
                    aria-invalid={errors.terms ? true : undefined}
                    aria-describedby={errors.terms ? 'terms-error' : undefined}
                  />
                  <span>
                    I understand this is a demo and agree to the{' '}
                    <button type="button" className="link-btn link-btn--inline" onClick={() => setShowTerms(true)}>demo terms</button>
                  </span>
                </label>
                {errors.terms && <p id="terms-error" className="field__error">{errors.terms}</p>}
              </div>

              <Button type="submit" size="lg" block loading={status === 'loading'}>
                {status === 'loading' ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </>
        )}

        <div className="divider"><span>or</span></div>
        <p className="auth-form__switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>

      {showTerms && (
        <Modal title="Demo terms" onClose={() => setShowTerms(false)} size="sm" footer={<Button onClick={() => setShowTerms(false)}>Got it</Button>}>
          <ul className="terms-list">
            <li>BuildSphere is a frontend prototype built for learning and demonstration.</li>
            <li>Your account and workspace are stored only in this browser’s local storage.</li>
            <li>Your password is hashed before it is saved, but this is not secure authentication. Don’t reuse a real password.</li>
            <li>Clearing your browser data removes your demo account and projects.</li>
          </ul>
        </Modal>
      )}
    </AuthLayout>
  );
}
