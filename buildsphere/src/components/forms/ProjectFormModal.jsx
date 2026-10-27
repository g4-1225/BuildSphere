import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Field } from '../common/Field';
import { Avatar } from '../common/Avatar';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES, PROJECT_STATUS, shortName } from '../../utils/projectUtils';
import { addDays, startOfToday, toISODate } from '../../utils/dateUtils';

function emptyForm() {
  const today = startOfToday();
  return {
    name: '',
    description: '',
    category: '',
    tags: '',
    startDate: toISODate(today),
    dueDate: toISODate(addDays(today, 30)),
    teamMembers: ['me'],
    status: 'in-progress',
  };
}

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 3) errors.name = 'Enter a project name of at least 3 characters.';
  if (!values.description.trim()) errors.description = 'Add a short description so teammates know what this is.';
  if (!values.category) errors.category = 'Choose a category.';
  if (!values.startDate) errors.startDate = 'Choose a start date.';
  if (!values.dueDate) errors.dueDate = 'Choose a due date.';
  else if (values.startDate && values.dueDate < values.startDate) errors.dueDate = 'The due date must be on or after the start date.';
  if (values.teamMembers.length === 0) errors.teamMembers = 'Select at least one team member.';
  return errors;
}

/** Used for both creating and editing a project. */
export default function ProjectFormModal({ project, onClose }) {
  const { members, addProject, updateProject } = useWorkspace();
  const { showToast } = useToast();
  const isEdit = Boolean(project);
  const [values, setValues] = useState(() =>
    isEdit ? { ...project, tags: (project.tags || []).join(', ') } : emptyForm()
  );
  const [errors, setErrors] = useState({});

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function toggleMember(id) {
    const next = values.teamMembers.includes(id)
      ? values.teamMembers.filter((m) => m !== id)
      : [...values.teamMembers, id];
    setField('teamMembers', next);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      event.currentTarget.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category: values.category,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 4),
      startDate: values.startDate,
      dueDate: values.dueDate,
      teamMembers: values.teamMembers,
      status: values.status,
    };
    if (isEdit) {
      updateProject(project.id, payload);
      showToast(`Saved changes to ${shortName(payload.name)}`);
    } else {
      addProject(payload);
      showToast(`Created ${shortName(payload.name)}`);
    }
    onClose();
  }

  return (
    <Modal
      title={isEdit ? 'Edit project' : 'New project'}
      description={isEdit ? 'Update the details your team sees.' : 'Add the basics now. You can add tasks right after.'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="project-form">{isEdit ? 'Save changes' : 'Create Project'}</Button>
        </>
      }
    >
      <form id="project-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field
          label="Project name"
          required
          className="span-2"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          placeholder="e.g. CampusConnect — Campus Community Platform"
          hint="Tip: use “Name — subtitle” to show a subtitle on the card."
          data-autofocus
        />
        <Field
          as="textarea"
          label="Short description"
          required
          className="span-2"
          rows={3}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          error={errors.description}
          maxLength={180}
        />
        <Field as="select" label="Category" required value={values.category} onChange={(e) => setField('category', e.target.value)} error={errors.category}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Field>
        <Field label="Tech tags" value={values.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="React, Firebase" hint="Comma separated, up to 4." />
        <Field type="date" label="Start date" required value={values.startDate} onChange={(e) => setField('startDate', e.target.value)} error={errors.startDate} />
        <Field type="date" label="Due date" required value={values.dueDate} onChange={(e) => setField('dueDate', e.target.value)} error={errors.dueDate} />
        <Field as="select" label="Status" value={values.status} onChange={(e) => setField('status', e.target.value)}>
          {Object.entries(PROJECT_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Field>

        <fieldset className={`field span-2 ${errors.teamMembers ? 'field--error' : ''}`} aria-describedby={errors.teamMembers ? 'team-error' : undefined}>
          <legend className="field__label">Team members <span className="field__required" aria-hidden="true">*</span></legend>
          <div className="member-picker">
            {members.map((member) => (
              <label key={member.id} className={`member-chip ${values.teamMembers.includes(member.id) ? 'is-selected' : ''}`}>
                <input type="checkbox" className="sr-only" checked={values.teamMembers.includes(member.id)} onChange={() => toggleMember(member.id)} />
                <Avatar member={member} size="xs" showTitle={false} />
                <span>{member.id === 'me' ? `${member.name} (you)` : member.name}</span>
              </label>
            ))}
          </div>
          {errors.teamMembers && <p id="team-error" className="field__error">{errors.teamMembers}</p>}
        </fieldset>
      </form>
    </Modal>
  );
}
