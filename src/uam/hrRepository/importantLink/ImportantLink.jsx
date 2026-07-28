import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hrToolHomePageData } from "../constant/data";
import {
  fetchAllImportantLinks,
  addNewImportantLink,
  updateImportantLink,
  deleteImportantLink,
} from "../../../actions/hrRepositoryAction";
import { convertHrRepositoryDateFormat as convertDateFormat } from "../Common/utils/hrRepositoryDateUtils";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import "./styles/importantLinkTable.scss";

// ── Icons (inline SVGs keep zero extra deps) ───────────────────────────────
const LinkIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const EditIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const TrashIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ArrowIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
      d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const CloseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────
const ImportantLink = () => {
  const dispatch = useDispatch();

  const { importantLink, loading, myHrmsAccess } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete'
  const [formData, setFormData] = useState({ id: "", toolName: "", toolLink: "" });

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2,
    });
    dispatch(fetchAllImportantLinks());
  }, [dispatch]);

  // ── Permissions ───────────────────────────────────────────────────────────
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some((p) => p.name === permissionName);
  };

  const canCreate = hasPermission("ImportantLink_create");
  const canUpdate = hasPermission("ImportantLink_update");
  const canDelete = hasPermission("ImportantLink_delete");
  const canViewAdmin =
    allToolsAccessDetails?.[selectedToolName] >= 900 ||
    myHrmsAccess?.permissions?.some((p) => p.name === "ImportantLinkAdmin_view");

  // ── Validation ─────────────────────────────────────────────────────────────
  const isValidLink = (link) => {
    if (!link || link.trim() === "") return false;
    return /^https?:\/\/.+\.[a-zA-Z]{2,}(\/.*)?$/.test(link);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData({ id: "", toolName: "", toolLink: "" });
    setModalMode("add");
  };

  const openEdit = (link) => {
    setFormData({ id: link.id, toolName: link.toolName, toolLink: link.toolLink });
    setModalMode("edit");
  };

  const openDelete = (link) => {
    setFormData({ id: link.id, toolName: link.toolName, toolLink: link.toolLink });
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({ id: "", toolName: "", toolLink: "" });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.toolName.trim() || !formData.toolLink.trim()) {
      return;
    }
    if (!isValidLink(formData.toolLink)) {
      return;
    }
    if (modalMode === "add") {
      await dispatch(addNewImportantLink([{ toolName: formData.toolName.trim(), toolLink: formData.toolLink.trim() }]));
    } else {
      await dispatch(updateImportantLink([{ id: formData.id, toolName: formData.toolName.trim(), toolLink: formData.toolLink.trim() }]));
    }
    closeModal();
    dispatch(fetchAllImportantLinks());
  };

  const handleDelete = async () => {
    await dispatch(deleteImportantLink([formData.id]));
    closeModal();
    dispatch(fetchAllImportantLinks());
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="imp_link_page">
      {/* Header */}
      <div className="imp_link_header">
        <div className="imp_link_header_left">
          <h2 className="imp_link_title">Important Links</h2>
          <p className="imp_link_subtitle">
            Quick access to important resources and external tools.
          </p>
        </div>
        {canCreate && (
          <button className="imp_link_add_btn" onClick={openAdd}>
            <PlusIcon />
            Add New Link
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading Links..." height="40vh" />
      ) : !importantLink || importantLink.length === 0 ? (
        <div className="imp_link_empty">
          <div className="empty_icon">
            <LinkIcon />
          </div>
          <h4>No Important Links Yet</h4>
          <p>Links and tools configured by HR will appear here for easy workspace access.</p>

        </div>
      ) : (
        <>
          <p className="imp_link_section_label">All Links ({importantLink.length})</p>
          <div className="imp_link_list">
            {importantLink.map((link) => (
              <div className="imp_link_tile" key={link.id}>
                {/* Icon */}
                <div className="tile_icon">
                  <LinkIcon />
                </div>

                {/* Name + URL */}
                <div className="tile_info">
                  <p className="tile_name">{link.toolName}</p>
                  <a
                    href={link.toolLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tile_link"
                  >
                    {link.toolLink}
                    <ArrowIcon />
                  </a>
                </div>

                {/* Meta (admin only) */}
                {canViewAdmin && (
                  <div className="tile_meta">
                    {link.creator && (
                      <div className="tile_meta_row">
                        <span className="tile_meta_label">By</span>
                        <span className="tile_meta_value">{link.creator.name}</span>
                      </div>
                    )}
                    {link.createdAt && (
                      <div className="tile_meta_row">
                        <span className="tile_meta_label">On</span>
                        <span className="tile_meta_value">{convertDateFormat(link.createdAt)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {(canUpdate || canDelete) && (
                  <div className="tile_actions">
                    {canUpdate && (
                      <button
                        className="tile_action_btn"
                        onClick={() => openEdit(link)}
                        title="Edit Link"
                      >
                        <EditIcon />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="tile_action_btn delete_btn"
                        onClick={() => openDelete(link)}
                        title="Delete Link"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Add / Edit popup ─────────────────────────────────────────────── */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="imp_link_popup_overlay" onClick={closeModal}>
          <div className="imp_link_popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup_header">
              <p className="popup_title">
                {modalMode === "add" ? "Add New Link" : "Edit Link"}
              </p>
              <button className="popup_close_btn" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="popup_body">
                <div className="form_field">
                  <label htmlFor="il_toolName">Link Name</label>
                  <input
                    id="il_toolName"
                    type="text"
                    value={formData.toolName}
                    onChange={(e) => setFormData({ ...formData, toolName: e.target.value })}
                    placeholder="e.g. Employee Portal"
                    autoComplete="off"
                    required
                  />
                </div>
                <div className="form_field">
                  <label htmlFor="il_toolLink">Link URL</label>
                  <input
                    id="il_toolLink"
                    type="text"
                    value={formData.toolLink}
                    onChange={(e) => setFormData({ ...formData, toolLink: e.target.value })}
                    placeholder="https://example.com"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="popup_footer">
                <button type="button" className="btn_cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn_submit">
                  {modalMode === "add" ? "Create Link" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation popup ─────────────────────────────────────── */}
      {modalMode === "delete" && (
        <div className="imp_link_popup_overlay" onClick={closeModal}>
          <div className="imp_link_popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup_header">
              <p className="popup_title">Delete Link</p>
              <button className="popup_close_btn" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="popup_body">
              <p className="delete_confirm_text">
                Are you sure you want to delete <strong>&quot;{formData.toolName}&quot;</strong>?
                This action cannot be undone.
              </p>
            </div>

            <div className="popup_footer">
              <button className="btn_cancel" onClick={closeModal}>Cancel</button>
              <button className="btn_submit danger" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantLink;
