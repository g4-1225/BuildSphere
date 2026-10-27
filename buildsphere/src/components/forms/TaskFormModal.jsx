import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Field } from '../common/Field';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useToast } from '../../context/ToastContext';
import { PRIORITY, TASK_STATUS, shortName } from '../../utils/projectUtils';
import { addDays, startOfToday, toISODate } from '../../utils/dateUtils';

function validate(values) {
  const errors = {};
  if (values.title.trim().length < 3) errors.title = 'Enter a task title of at least 3 characters.';
  if (!values.projectId) errors.projectId = 'Choose the project this task belongs to.';
  if (!values.dueDate) errors.dueDate = 'Choose a due date.';
  return errors;
}

/** Create or edit a task. `defaults` can pre-select a project. */
export default function TaskFormModal({ task, defaults = {}, onClose }) {
  const { projects, members, addTask, updateTask } = useWorkspace();
  const { showToast } = useToast();
  const isEdit = Boolean(task);
  const openProjects = projects.filter((p) => p.status !== 'completed' || p.id === task?.projectId || p.id === defaults.projectId);

  const [values, setValues] = useState(() =>
    isEdit
      ? { ...task }
      : {
          title: '',
          projectId: defaults.projectId || openProjects[0]?.id || '',
          description: '',
          priority: 'medium',
          status: 'todo',
          dueDate: toISODate(addDays(startOfToday(), 7)),
          assignedTo: 'me',
        }
  );
  const [errors, setErrors] = useState({});

  const project = projects.find((p) => p.id === values.projectId);
  const projectMembers = members.filter((m) => project?.teamMembers.includes(m.id));
  const otherMembers = members.filter((m) => !project?.teamMembers.includes(m.id));

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
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
      title: values.title.trim(),
      projectId: values.projectId,
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate,
      assignedTo: values.assignedTo,
    };
    if (isEdit) {
      updateTask(task.id, payload);
      showToast('Task updated');
    } else {
      addTask(payload);
      showToast(`Added “${payload.title}” to ${shortName(project?.name)}`);
    }
    onClose();
  }

  if (projects.length === 0) {
    return (
      <Modal title="New task" onClose={onClose} size="sm" footer={<Button onClick={onClose}>Got it</Button>}>
        <p>Tasks belong to a project. Create a project first, then add tasks to it.</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEdit ? 'Edit task' : 'New task'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form">{isEdit ? 'Save changes' : 'Create Task'}</Button>
        </>
      }
    >
      <form id="task-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field label="Task title" required className="span-2" value={values.title} onChange={(e) => setField('title', e.target.value)} error={errors.title} placeholder="e.g. Design the login page" data-autofocus />
        <Field as="select" label="Project" required value={values.projectId} onChange={(e) => setField('projectId', e.target.value)} error={errors.projectId}>
          <option value="">Select a project</option>
          {openProjects.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)}</option>)}
        </Field>
        <Field as="select" label="Assigned to" value={values.assignedTo} onChange={(e) => setField('assignedTo', e.target.value)}>
          <option value="">Unassigned</option>
          {projectMembers.length > 0 && (
            <optgroup label="Project team">
              {projectMembers.map((m) => <option key={m.id} value={m.id}>{m.id === 'me' ? `${m.name} (you)` : m.name}</option>)}
            </optgroup>
          )}
          {otherMembers.length > 0 && (
            <optgroup label="Other members">
              {otherMembers.map((m) => <option key={m.id} value={m.id}>{m.id === 'me' ? `${m.name} (you)` : m.name}</option>)}
            </optgroup>
          )}
        </Field>
        <Field as="textarea" label="Description" className="span-2" rows={3} value={values.description} onChange={(e) => setField('description', e.target.value)} placeholder="What does done look like?" />

        <fieldset className="field">
          <legend className="field__label">Priority</legend>
          <div className="segmented" role="radiogroup" aria-label="Priority">
            {Object.entries(PRIORITY).map(([value, label]) => (
              <label key={value} className={`segmented__option segmented__option--${value} ${values.priority === value ? 'is-active' : ''}`}>
                <input type="radio" name="priority" value={value} checked={values.priority === value} onChange={() => setField('priority', value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <Field as="select" label="Status" value={values.status} onChange={(e) => setField('status', e.target.value)}>
          {Object.entries(TASK_STATUS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </Field>
        <Field type="date" label="Due date" required value={values.dueDate} onChange={(e) => setField('dueDate', e.target.value)} error={errors.dueDate} />
      </form>
    </Modal>
  );
}
