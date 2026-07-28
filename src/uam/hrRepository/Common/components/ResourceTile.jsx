/**
 * ResourceTile – reusable card-style tile for Links and Policies.
 *
 * Props:
 *   icon        – JSX (SVG node) shown top-left
 *   title       – main text
 *   subtitle    – secondary line (URL / version string)
 *   href        – if set, subtitle becomes a clickable link
 *   badge       – optional badge text (e.g. version)
 *   meta        – array of { label, value } shown in footer
 *   showMeta    – bool — show the footer meta section
 *   canEdit     – bool
 *   canDelete   – bool
 *   onEdit      – fn
 *   onDelete    – fn
 */
import "./ResourceTile.scss";

const ResourceTile = ({
  icon,
  title,
  subtitle,
  href,
  badge,
  meta = [],
  showMeta = false,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="resource-tile">
      {/* top row */}
      <div className="resource-tile__top">
        <div className="resource-tile__icon-wrap">
          {icon}
        </div>

        {(canEdit || canDelete) && (
          <div className="resource-tile__actions">
            {canEdit && (
              <button
                className="resource-tile__action-btn"
                onClick={onEdit}
                title="Edit"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                className="resource-tile__action-btn resource-tile__action-btn--delete"
                onClick={onDelete}
                title="Delete"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* middle */}
      <div className="resource-tile__body">
        <div className="resource-tile__title-row">
          <h3 className="resource-tile__title">{title}</h3>
          {badge && <span className="resource-tile__badge">{badge}</span>}
        </div>

        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="resource-tile__link">
            {subtitle}
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        ) : (
          subtitle && <p className="resource-tile__subtitle">{subtitle}</p>
        )}
      </div>

      {/* footer meta */}
      {showMeta && meta.length > 0 && (
        <footer className="resource-tile__footer">
          {meta.map((m, i) => (
            <div className="resource-tile__meta-row" key={i}>
              <span className="resource-tile__meta-label">{m.label}</span>
              <span className="resource-tile__meta-value">{m.value}</span>
            </div>
          ))}
        </footer>
      )}
    </article>
  );
};

export default ResourceTile;
