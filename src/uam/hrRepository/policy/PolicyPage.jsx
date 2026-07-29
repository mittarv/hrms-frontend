import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hrToolHomePageData } from "../constant/data";
import {
  addNewPolicy,
  deletePolicy,
  fetchAllPolicyDocuments,
  updateExistingPolicy,
} from "../../../actions/hrRepositoryAction";
import { convertHrRepositoryDateFormat as convertDateFormat } from "../Common/utils/hrRepositoryDateUtils";
import LoadingSpinner from "../Common/components/LoadingSpinner";
import "./styles/policyPage.scss";

// ── Inline SVG icons ────────────────────────────────────────────────────────
const DocIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

// ── Empty form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  id: "",
  policyName: "",
  policyLink: "",
  remarks: "",
  approvedBy: "",
  version: "",
};

// ── Component ───────────────────────────────────────────────────────────────
const PolicyPage = () => {
  const dispatch = useDispatch();

  const { policy, loading, myHrmsAccess } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const { allToolsAccessDetails } = useSelector((state) => state.user);
  const { selectedToolName } = useSelector((state) => state.mittarvtools);

  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | 'delete'
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    dispatch({
      type: "SET_SELECTED_TOOL_NAME",
      payload: hrToolHomePageData.toot_title2,
    });
    dispatch(fetchAllPolicyDocuments());
  }, [dispatch]);

  // ── Permissions ────────────────────────────────────────────────────────────
  const hasPermission = (permissionName) => {
    const isAdmin = allToolsAccessDetails?.[selectedToolName] >= 900;
    if (isAdmin) return true;
    return myHrmsAccess?.permissions?.some((p) => p.name === permissionName);
  };

  const canCreate = hasPermission("Policy_create");
  const canUpdate = hasPermission("Policy_update");
  const canDelete = hasPermission("Policy_delete");
  const canViewAdmin =
    allToolsAccessDetails?.[selectedToolName] >= 900 ||
    myHrmsAccess?.permissions?.some((p) => p.name === "policyAdmin_view");

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setModalMode("add");
  };

  const openEdit = (pol) => {
    setFormData({
      id: pol.id,
      policyName: pol.policyName ?? "",
      policyLink: pol.policyLink ?? "",
      remarks: pol.remarks ?? "",
      approvedBy: pol.approvedBy ?? "",
      version: pol.version ?? "",
    });
    setModalMode("edit");
  };

  const openDelete = (pol) => {
    setFormData({ ...EMPTY_FORM, id: pol.id, policyName: pol.policyName });
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setFormData({ ...EMPTY_FORM });
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const { policyName, policyLink, approvedBy, version } = formData;
    if (!policyName || !policyLink || !approvedBy || !version) {
      return;
    }

    const payload = [
      {
        ...(formData.id ? { id: formData.id } : {}),
        policyName: formData.policyName.trim(),
        policyLink: formData.policyLink.trim(),
        remarks: formData.remarks.trim(),
        approvedBy: formData.approvedBy.trim(),
        version: formData.version.trim(),
      },
    ];

    if (modalMode === "add") {
      await dispatch(addNewPolicy(payload));
    } else {
      await dispatch(updateExistingPolicy(payload));
    }
    closeModal();
    dispatch(fetchAllPolicyDocuments());
  };

  const handleDelete = async () => {
    await dispatch(deletePolicy([formData.id]));
    closeModal();
    dispatch(fetchAllPolicyDocuments());
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="policy_page">
      {/* Header */}
      <div className="policy_header">
        <div className="policy_header_left">
          <h2 className="policy_title">Company Policies</h2>
          <p className="policy_subtitle">
            View and manage all official company policy documents.
          </p>
        </div>
        {canCreate && (
          <button className="policy_add_btn" onClick={openAdd}>
            <PlusIcon />
            Add New Policy
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading Policies..." height="40vh" />
      ) : !policy || policy.length === 0 ? (
        <div className="policy_empty">
          <div className="empty_icon">
            <DocIcon />
          </div>
          <h4>No Policies Added Yet</h4>
          <p>Policy documents uploaded by HR will appear here.</p>

        </div>
      ) : (
        <>
          <p className="policy_section_label">All Policies ({policy.length})</p>
          <div className="policy_list">
            {policy.map((pol) => (
              <div className="policy_tile" key={pol.id}>
                {/* Icon */}
                <div className="tile_icon">
                  <DocIcon />
                </div>

                {/* Name + link + remarks */}
                <div className="tile_info">
                  <p className="tile_name">{pol.policyName}</p>
                  <a
                    href={pol.policyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tile_link"
                  >
                    View Document
                    <ArrowIcon />
                  </a>
                  {pol.remarks && (
                    <p className="tile_remarks">{pol.remarks}</p>
                  )}
                </div>

                {/* Version badge */}
                {pol.version && (
                  <span className="tile_badge">v{pol.version}</span>
                )}

                {/* Meta (admin only) */}
                {canViewAdmin && (
                  <div className="tile_meta">
                    {pol.approvedBy && (
                      <div className="tile_meta_row">
                        <span className="tile_meta_label">Approved by</span>
                        <span className="tile_meta_value">{pol.approvedBy}</span>
                      </div>
                    )}
                    {pol.creator?.name && (
                      <div className="tile_meta_row">
                        <span className="tile_meta_label">By</span>
                        <span className="tile_meta_value">{pol.creator.name}</span>
                      </div>
                    )}
                    {pol.createdAt && (
                      <div className="tile_meta_row">
                        <span className="tile_meta_label">On</span>
                        <span className="tile_meta_value">{convertDateFormat(pol.createdAt)}</span>
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
                        onClick={() => openEdit(pol)}
                        title="Edit Policy"
                      >
                        <EditIcon />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="tile_action_btn delete_btn"
                        onClick={() => openDelete(pol)}
                        title="Delete Policy"
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
        <div className="policy_popup_overlay" onClick={closeModal}>
          <div className="policy_popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup_header">
              <p className="popup_title">
                {modalMode === "add" ? "Add New Policy" : "Edit Policy"}
              </p>
              <button className="popup_close_btn" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="popup_body">
                <div className="form_field">
                  <label htmlFor="pol_name">Policy Name *</label>
                  <input
                    id="pol_name"
                    type="text"
                    value={formData.policyName}
                    onChange={(e) => setFormData({ ...formData, policyName: e.target.value })}
                    placeholder="e.g. Leave Policy"
                    required
                  />
                </div>
                <div className="form_field">
                  <label htmlFor="pol_link">Policy Link *</label>
                  <input
                    id="pol_link"
                    type="text"
                    value={formData.policyLink}
                    onChange={(e) => setFormData({ ...formData, policyLink: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                  />
                </div>
                <div className="form_field">
                  <label htmlFor="pol_version">Version *</label>
                  <input
                    id="pol_version"
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="e.g. 1.0"
                    required
                  />
                </div>
                <div className="form_field">
                  <label htmlFor="pol_approved">Approved By *</label>
                  <input
                    id="pol_approved"
                    type="text"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    placeholder="e.g. HR Manager"
                    required
                  />
                </div>
                <div className="form_field">
                  <label htmlFor="pol_remarks">Remarks</label>
                  <input
                    id="pol_remarks"
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Optional remarks"
                  />
                </div>
              </div>

              <div className="popup_footer">
                <button type="button" className="btn_cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn_submit">
                  {modalMode === "add" ? "Create Policy" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation popup ─────────────────────────────────────── */}
      {modalMode === "delete" && (
        <div className="policy_popup_overlay" onClick={closeModal}>
          <div className="policy_popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup_header">
              <p className="popup_title">Delete Policy</p>
              <button className="popup_close_btn" onClick={closeModal}>
                <CloseIcon />
              </button>
            </div>

            <div className="popup_body">
              <p className="delete_confirm_text">
                Are you sure you want to delete{" "}
                <strong>&quot;{formData.policyName}&quot;</strong>? This action cannot be undone.
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

export default PolicyPage;
