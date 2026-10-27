import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Archive, Download, ExternalLink, File, FileCode, FileImage, FileSpreadsheet, FileText, Info, Presentation, Trash2, UploadCloud, X,
} from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import SearchNotice from './SearchNotice';
import PageHeader from './PageHeader';
import { useWorkspace } from '../context/WorkspaceContext';
import { useToast } from '../context/ToastContext';
import { formatFileSize, getFileType, matchesQuery, shortName } from '../utils/projectUtils';
import { formatDateLong } from '../utils/dateUtils';

const TYPE_ICONS = {
  PDF: FileText, Document: FileText, Slides: Presentation, Spreadsheet: FileSpreadsheet,
  Image: FileImage, Code: FileCode, Archive, Other: File,
};
const MAX_FILE_MB = 25;

export default function ResourcesPage() {
  const ui = useOutletContext();
  const { resources, projects, fileUrls, addResources, deleteResource } = useWorkspace();
  const { showToast } = useToast();
  const inputRef = useRef(null);
  const [staged, setStaged] = useState([]);
  const [targetProject, setTargetProject] = useState(projects[0]?.id || '');
  const [projectFilter, setProjectFilter] = useState('all');
  const [dragging, setDragging] = useState(false);

  const projectLabel = (id) => (id ? shortName(projects.find((p) => p.id === id)?.name || 'Deleted project') : 'Unassigned');

  const visible = resources.filter(
    (r) => (projectFilter === 'all' || r.projectId === projectFilter) && matchesQuery([r.title, r.type, projectLabel(r.projectId)], ui.search)
  );

  function stageFiles(fileList) {
    const files = Array.from(fileList);
    const tooBig = files.filter((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    const ok = files.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
    if (tooBig.length) showToast(`${tooBig.length} file(s) skipped: the demo limit is ${MAX_FILE_MB} MB per file.`, 'error');
    setStaged((current) => [...current, ...ok]);
  }

  function handleAdd() {
    addResources(staged, targetProject);
    showToast(`Added ${staged.length} file${staged.length === 1 ? '' : 's'} to resources`);
    setStaged([]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function requestDelete(resource) {
    ui.confirm({
      title: 'Remove this resource?',
      message: `“${resource.title}” will be removed from the resource list.`,
      confirmLabel: 'Remove',
      onConfirm: () => {
        deleteResource(resource.id);
        showToast('Resource removed');
      },
    });
  }

  return (
    <div className="page">
      <PageHeader title="Resources" text="Proposals, reports, datasets and designs for each project." />

      <section className="panel upload-panel" aria-labelledby="upload-heading">
        <h3 id="upload-heading" className="panel__title">Add files</h3>
        <label
          className={`dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); stageFiles(e.dataTransfer.files); }}
        >
          <UploadCloud size={26} aria-hidden="true" />
          <span className="dropzone__title">Drop files here or <span className="dropzone__browse">browse</span></span>
          <span className="dropzone__hint">Up to {MAX_FILE_MB} MB each</span>
          <input ref={inputRef} type="file" multiple className="sr-only" onChange={(e) => stageFiles(e.target.files)} />
        </label>

        {staged.length > 0 && (
          <div className="staged">
            <ul className="staged__list" aria-label="Selected files">
              {staged.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <span className="staged__name">{file.name}</span>
                  <span className="muted small">{getFileType(file.name)}, {formatFileSize(file.size)}</span>
                  <button type="button" className="icon-btn icon-btn--sm" aria-label={`Remove ${file.name}`} onClick={() => setStaged((s) => s.filter((_, i) => i !== index))}>
                    <X size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="staged__actions">
              <label className="select-inline">
                <span className="small">Add to</span>
                <select value={targetProject} onChange={(e) => setTargetProject(e.target.value)}>
                  <option value="">No project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)}</option>)}
                </select>
              </label>
              <Button variant="secondary" size="sm" onClick={() => setStaged([])}>Clear</Button>
              <Button size="sm" onClick={handleAdd}>Add {staged.length} file{staged.length === 1 ? '' : 's'}</Button>
            </div>
          </div>
        )}

        <p className="note">
          <Info size={16} aria-hidden="true" />
          Files are not uploaded to a server. They stay in this browser tab and can be opened until you refresh; only the file details are saved.
        </p>
      </section>

      <SearchNotice ui={ui} count={visible.length} noun="resources" />

      <section className="panel" aria-labelledby="library-heading">
        <header className="panel__header">
          <h3 id="library-heading" className="panel__title">Library</h3>
          <label className="select-inline">
            <span className="sr-only">Filter by project</span>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All projects</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{shortName(p.name)}</option>)}
            </select>
          </label>
        </header>

        {visible.length === 0 ? (
          <EmptyState compact icon={File} title="No resources here yet" text="Add a proposal, dataset or design file above." />
        ) : (
          <ul className="resource-list">
            {visible.map((resource) => {
              const Icon = TYPE_ICONS[resource.type] || File;
              const url = fileUrls[resource.id];
              return (
                <li key={resource.id} className="resource">
                  <span className={`resource__icon resource__icon--${resource.type.toLowerCase()}`}><Icon size={20} aria-hidden="true" /></span>
                  <div className="resource__body">
                    <p className="resource__title">{resource.title}</p>
                    <p className="resource__meta">
                      {projectLabel(resource.projectId)}, added {formatDateLong(resource.uploadedAt)}, {formatFileSize(resource.size)}
                    </p>
                  </div>
                  <Badge tone="neutral" className="resource__type">{resource.type}</Badge>
                  <div className="resource__actions">
                    {url ? (
                      <>
                        <a className="icon-btn icon-btn--sm" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${resource.title}`} title="Open"><ExternalLink size={16} aria-hidden="true" /></a>
                        <a className="icon-btn icon-btn--sm" href={url} download={resource.title} aria-label={`Download ${resource.title}`} title="Download"><Download size={16} aria-hidden="true" /></a>
                      </>
                    ) : (
                      <span className="resource__unavailable" title={resource.demo ? 'Sample entry with no file attached' : 'File was only available before the page was refreshed'}>
                        {resource.demo ? 'Sample, no file' : 'File not stored'}
                      </span>
                    )}
                    <button type="button" className="icon-btn icon-btn--sm" aria-label={`Remove ${resource.title}`} title="Remove" onClick={() => requestDelete(resource)}>
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
