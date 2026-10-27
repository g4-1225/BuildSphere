import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, TriangleAlert } from 'lucide-react';
import AuthLayout from '../components/forms/AuthLayout';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Checkbox, Field, PasswordField } from '../components/common/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address, like name@college.edu.';
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    document.title = 'Log in — BuildSphere';
  }, []);

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
    setLoading(true);
    try {
      await login(values);
      showToast('Welcome back! You’re signed in to the demo workspace.');
      // The GuestOnly route guard redirects to the workspace once the session exists.
    } catch (error) {
      setFormError(error.message);
      setLoading(false);
    }
  }

  return (
    <AuthLayout heading="Welcome to your project workspace" text="Tasks, teammates and deadlines for every academic project, kept in one place.">
      <div className="auth-form">
        <h1 className="auth-form__title">Welcome back</h1>
        <p className="auth-form__subtitle">Pick up where your projects left off.</p>

        {formError && (
          <div className="form-alert" role="alert">
            <TriangleAlert size={18} aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="form-stack">
          <Field label="Email address" type="email" autoComplete="email" required value={values.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} placeholder="you@college.edu" />
          <PasswordField required autoComplete="current-password" value={values.password} onChange={(e) => setField('password', e.target.value)} error={errors.password} />

          <div className="auth-form__row">
            <Checkbox label="Remember me" checked={values.remember} onChange={(e) => setField('remember', e.target.checked)} />
            <button type="button" className="link-btn" onClick={() => setShowRecovery(true)}>Forgot password?</button>
          </div>

          <Button type="submit" size="lg" block loading={loading}>{loading ? 'Logging in…' : 'Log In'}</Button>
        </form>

        <p className="demo-note">
          <Info size={16} aria-hidden="true" />
          <span>Demo mode: any valid email and password signs you in. Accounts you create here must use their saved password. Nothing leaves this browser.</span>
        </p>

        <div className="divider"><span>or</span></div>
        <p className="auth-form__switch">Don’t have an account? <Link to="/signup">Sign up</Link></p>
      </div>

      {showRecovery && <RecoveryModal initialEmail={values.email} onClose={() => setShowRecovery(false)} />}
    </AuthLayout>
  );
}

function RecoveryModal({ initialEmail, onClose }) {
  const { hasDemoAccount, removeDemoAccount } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function handleCheck(event) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setResult(hasDemoAccount(email) ? 'found' : 'none');
  }

  return (
    <Modal title="Reset your demo password" description="There is no email service in this prototype, so no reset link can be sent." onClose={onClose} size="sm">
      <form onSubmit={handleCheck} className="form-stack" noValidate>
        <Field label="Email address" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setResult(null); }} error={error} data-autofocus />
        <Button type="submit" variant="secondary">Check this email</Button>
      </form>
      {result === 'none' && (
        <p className="note note--block recovery-result">
          <Info size={16} aria-hidden="true" />
          No demo account is saved for this email, so any password will work for it.
        </p>
      )}
      {result === 'found' && (
        <div className="recovery-result">
          <p>A demo account exists for this email in this browser. You can remove it and then log in with any password. Your workspace data is kept.</p>
          <Button
            variant="danger"
            onClick={() => {
              removeDemoAccount(email);
              showToast('Demo account removed. Log in with any password.', 'info');
              onClose();
            }}
          >
            Remove saved demo account
          </Button>
        </div>
      )}
    </Modal>
  );
}
