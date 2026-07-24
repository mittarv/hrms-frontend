import { useEffect, useState, useRef, } from "react";
import { useDispatch } from "react-redux";
import { getOrganizationDetails, updateOrganizationDetails } from "../../../../actions/hrRepositoryAction";
import { Button, CircularProgress } from "@mui/material";
import Snackbar from "../../Common/components/Snackbar";

const OrgDetailsTab = () => {
  const dispatch = useDispatch();
  const [orgDetails, setOrgDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFileBase64, setLogoFileBase64] = useState("");
  const [address, setAddress] = useState("");
  const [addressModified, setAddressModified] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      setIsLoading(true);
      const data = await dispatch(getOrganizationDetails());
      if (data) {
        setOrgDetails(data);
        if (data.metadata?.logo) {
          setLogoPreview(data.metadata.logo);
        }
        if (data.metadata?.address) {
          setAddress(data.metadata.address);
        }
      }
      setIsLoading(false);
    };

    fetchOrgDetails();
  }, [dispatch]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Logo size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setLogoFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      empCompanyId: orgDetails?.empCompanyId || orgDetails?.id,
      logo: logoFileBase64 || orgDetails?.metadata?.logo,
      address: address,
    };
    const success = await dispatch(updateOrganizationDetails(payload));
    if (success) {
      setSuccessMsg("Organization details updated successfully!");
      setLogoFileBase64("");
      setAddressModified(false);
      dispatch(getOrganizationDetails());
    } else {
      setErrorMsg("Failed to update organization details.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="org_profile_tab_container">

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={isSaving || (!addressModified && !logoFileBase64)}
          sx={{ textTransform: 'none', backgroundColor: '#033348', fontWeight: 600, '&:hover': { backgroundColor: '#002231' } }}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
        </Button>
      </div>

      <div className="org_profile_content">
        <div className="org_details_card">
          <div className="org_detail_group">
            <span className="detail_label">Organization Name</span>
            <span className="detail_value">{orgDetails?.name || "N/A"}</span>
          </div>
          
          <div className="org_detail_group">
            <span className="detail_label">Subdomain (Workspace)</span>
            <span className="detail_value">{orgDetails?.subdomain || "N/A"}</span>
          </div>

          <div className="org_detail_group">
            <span className="detail_label">Organization ID</span>
            <span className="detail_value id_badge">{orgDetails?.empCompanyId || orgDetails?.id || "N/A"}</span>
          </div>
        </div>

        <div className="org_logo_card">
          <h3 className="logo_card_title">Company Logo</h3>
          <p className="logo_card_subtitle">Upload your organization logo to display across the platform</p>
          
          <div className="logo_preview_container">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Organization Logo" 
                className="logo_preview_image"
              />
            ) : (
              <div className="logo_placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8', marginBottom: '8px' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>No Logo Uploaded</span>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: "none" }} 
            id="org-logo-upload"
          />
          
          <div className="logo_actions">
            <Button 
              variant="outlined" 
              onClick={() => fileInputRef.current.click()}
              className="change_logo_btn"
              sx={{ textTransform: 'none', color: '#033348', borderColor: '#dbe4eb', fontWeight: 600, '&:hover': { borderColor: '#033348', backgroundColor: '#f9fbff' } }}
            >
              Choose Image
            </Button>
          </div>
          <p className="logo_hint">Supported formats: PNG, JPG, JPEG (Max 2MB)</p>
        </div>

        {/* Company Address Section */}
        <div style={{ gridColumn: "1 / -1", padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginTop: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#033348', marginBottom: '6px' }}>Company Address</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>This official address will be displayed on generated employee payslips.</p>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressModified(true);
            }}
            placeholder="e.g. Ashoka Bhopal Chambers, 205, Above Standard Chartered Bank, Begumpet, Secunderabad, Hyderabad, Telangana 500003"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {successMsg && <Snackbar message={successMsg} type="success" onClose={() => setSuccessMsg("")} />}
      {errorMsg && <Snackbar message={errorMsg} type="error" onClose={() => setErrorMsg("")} />}
    </div>
  );
};

export default OrgDetailsTab;


