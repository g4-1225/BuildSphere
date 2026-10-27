import { useState } from 'react';
import { Info } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Field } from '../common/Field';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { shortName } from '../../utils/projectUtils';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Data Analyst', 'Researcher', 'Tester', 'Documentation'];

export default function MemberFormModal({ onClose }) {
  const { members, projects, addMember } = useWorkspace();
  const { showToast } = useToast();
  const [values, setValues] = useState({ name: '', email: '', role: ROLES[0], projectId: '' });
  const [errors, setErrors] = useState({});

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Enter the teammate’s name.';
    if (!EMAIL_PATTERN.test(values.email.trim())) found.email = 'Enter a valid email address, like name@college.edu.';
    else if (members.some((m) => m.email === values.email.trim().toLowerCase())) found.email = 'This person is already on your team.';
    setErrors(found);
    if (Object.keys(found).length) {
      event.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    addMember(values);
    showToast(`${values.name.trim()} added to your team`);
    onClose();
  }

  return (
    <Modal
      title="Add member"
      description="Add a teammate to this workspace so you can assign tasks to them."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="member-form">Add member</Button>
        </>
      }
    >
      <form id="member-form" className="form-stack" onSubmit={handleSubmit} noValidate>
        <Field label="Full name" required value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} data-autofocus />
        <Field type="email" label="Email address" required value={values.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} autoComplete="off" />
        <Field as="select" label="Role" value={values.role} onChange={(e) => setField('role', e.target.value)}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </Field>
        <Field as="select" label="Add to project" value={values.projectId} onChange={(e) => setField('projectId', e.target.value)}>
          <option value="">Not yet</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)}</option>)}
        </Field>
        <p className="note">
          <Info size={16} aria-hidden="true" />
          No invitation email is sent. The member is added to this browser’s demo workspace only.
        </p>
      </form>
    </Modal>
  );
}
