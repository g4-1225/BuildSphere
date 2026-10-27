import { Search, X } from 'lucide-react';

/** Shown on list pages while the header search is filtering results. */
export default function SearchNotice({ ui, count, noun = 'results' }) {
  if (!ui.search.trim()) return null;
  return (
    <div className="search-notice" role="status">
      <Search size={16} aria-hidden="true" />
      <span>
        {count} {noun} matching <strong>“{ui.search.trim()}”</strong>
      </span>
      <button type="button" className="link-btn" onClick={() => ui.setSearch('')}>
        <X size={14} aria-hidden="true" /> Clear search
      </button>
    </div>
  );
}
