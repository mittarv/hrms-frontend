import { useState } from "react";
import Plus_icon from "../../assets/icons/Add_Icon_blue.svg";
import Image_icon from "../../assets/icons/image_icon.svg";
import PDF_icon from "../../assets/icons/pdf_icon.svg";
import Delete_icon from "../../assets/icons/delete_icon.svg";
import Upload_icon from "../../assets/icons/upload_icon.svg";
import Cross_icon from "../../assets/icons/cross_icon.svg";
import "../styles/UploadProofPopup.scss";
import { useDispatch } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { getLeaveType, convertFileToBase64 } from "../../Common/utils/helper";
import { useSelector } from "react-redux";

const UploadProofPopup = ({
  isOpen,
  onClose,
  leaveData,
  onUpload,
  loading,
}) => {
  const { allExisitingLeaves } = useSelector(
    (state) => state.hrRepositoryReducer
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [remarks, setRemarks] = useState(leaveData?.remarks || "");
  const dispatch = useDispatch();

  if (!isOpen || !leaveData) return null;

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    // Check if multiple files are selected
    if (files.length > 1) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Please select only one file at a time.",
          severity: "info",
        },
      });
      return;
    }

    // Check if user is trying to add another file when one already exists
    if (selectedFiles.length > 0 && files.length > 0) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message:
            "You can only upload one file. Please remove the existing file first.",
          severity: "error",
        },
      });
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      const fileType = file.type.toLowerCase();
      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf",
      ];

      if (validTypes.includes(fileType)) {
        try {
          // Convert file to base64 with 10MB limit
          const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
          const fileData = await convertFileToBase64(file, maxSizeInBytes);
          
          // Create processed file object with base64 data
          const processedFile = {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            base64Data: fileData.base64,
            pureBase64: fileData.pureBase64,
            fileMetadata: fileData
          };
          
          validFiles.push(processedFile);
        } catch (error) {
          console.error('Error processing file:', error);
          dispatch({
            type: "SET_NEW_SNACKBAR_MESSAGE",
            payload: {
              message: error.message || "Error processing file. Please try again.",
              severity: "error",
            },
          });
          // Reset file input on error
          event.target.value = '';
          return;
        }
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: `The following files are not supported. Please upload only PNG, JPEG, or PDF files: ${invalidFiles.join(", ")}`,
          severity: "error",
        },
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles); 
    }
  };

  const handleFileSelectClick = () => {
    document.getElementById("file-input").click();
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((files) =>
      files.filter((_, index) => index !== indexToRemove)
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Please select a file to upload.",
          severity: "error",
        },
      });
      return;
    }
    
    dispatch({ type: "UPLOAD_PROOF_DOCUMENTS" });

    try {
      // Convert files to base64 format for storage
      const fileDataArray = selectedFiles.map((file) => ({
        base64: file.base64Data,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadTimestamp: new Date().toISOString()
      }));

      const transformedData = {
        files: JSON.stringify(fileDataArray),
        remarks: remarks.trim(),
      };

      onUpload(transformedData, leaveData.leaveRequestId);

      setSelectedFiles([]);
      setRemarks("");
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      dispatch({
        type: "SET_NEW_SNACKBAR_MESSAGE",
        payload: {
          message: "Error uploading files. Please try again.",
          severity: "error",
        },
      });
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    setRemarks("");
    onClose();
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} - ${end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  };

  return (
    <div className="upload_proof_overlay">
      <div className="upload_proof_popup">
        <div className="upload_proof_header">
          <p>Upload Proof</p>
          <button className="close_button" onClick={handleCancel}>
            <img src={Cross_icon} />
          </button>
        </div>

        <div className="upload_proof_content">
          {/* Leave Details Section */}
          <div className="leave_details_section">
            <h4>Leave details</h4>
            <div className="leave_info">
              <p>
                <strong>Duration:</strong>{" "}
                {formatDateRange(leaveData.startDate, leaveData.endDate)}
              </p>
              <p>
                <strong>Leave Type:</strong> {getLeaveType(leaveData.leaveConfigId, allExisitingLeaves)}
              </p>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="file_upload_section">
            <h4>Select a file to upload*</h4>
            {selectedFiles.length > 0 && (
              <div className="selected_files">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="selected_file_item">
                    <div className="file_info_1">
                      {file.type === "application/pdf" ? (
                        <img
                          src={PDF_icon}
                          alt="PDF"
                          className="file_type_icon"
                        />
                      ) : file.type === "image/jpeg" ||
                        file.type === "image/jpg" ||
                        file.type === "image/png" ? (
                        <img
                          src={Image_icon}
                          alt={file.name}
                          className="file_type_icon image_preview"
                        />
                      ) : (
                        <span className="file_type_icon">
                          <img src={Image_icon} />
                        </span>
                      )}
                      <span className="file_name">
                        {file.name.length > 25
                          ? file.name.slice(0, 25) + "..."
                          : file.name}
                      </span>
                    </div>
                    <div className="file_info_2">
                      <span className="file_size">
                        {formatFileSize(file.size)} |{" "}
                        {file.type.split("/")[1]?.toUpperCase()}
                      </span>
                      <button
                        className="remove_file_button"
                        onClick={() => removeFile(index)}
                      >
                        <img src={Delete_icon} alt="Delete" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="select_file_button"
              onClick={handleFileSelectClick}
            >
              <img src={Plus_icon} alt="Plus_icon" />
              Select file from device
            </button>

            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>

          {/* Remarks Section */}
          <div className="remarks_section">
            <h4>Remarks (optional)</h4>
            <input
              type="text"
              className="remarks_textarea"
              placeholder="A note elaborating on your document"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="upload_proof_actions">
          <button className="cancel_button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="upload_button_primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress />
              </Box>
            ) : (
              <>
                <img src={Upload_icon} alt="Upload" /> Upload document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadProofPopup;
