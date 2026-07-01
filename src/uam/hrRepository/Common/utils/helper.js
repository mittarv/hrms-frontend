export const removeAppendedSasToken = (url) => {
  try {
    const parts = url.split("?");
    return parts[0];
  } catch (error) {
    return url;
  }
}

export const formatDate = (dateString, DDMM = false) => {
  if (!dateString) return "";
  try {
    // Handle both ISO string format and regular date strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    // This will format date as "DD Mon" if DDMM is true, else "YYYY-MM-DD"
    if (DDMM) {
      const formatted = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const result = formatted.split(' ').reverse().join(' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
      return result;
    }
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
};

export const normalizeTime = (val) => {
  if (!val) return "";
  if (/^\d{2}:\d{2}:\d{2}$/.test(val)) return val;
  const date = new Date(val);
  if (isNaN(date)) return "";
  return date.toISOString().slice(11, 19);
};

export function toHHMMSS(time) {
  if (!time) return "";
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
  if (/^\d{2}:\d{2}$/.test(time)) return `${time}:00`;
  return time;
}

export const getLeaveType = (leaveConfigId, allExistingLeaves) => {
  const leaveType = allExistingLeaves?.find((leave) => leave?.leaveConfigId === leaveConfigId);
  return leaveType ? leaveType.leaveType : "Leave";
}

export const getComponentTypeValue = (Key, allComponentTypes) => {
  for (const category in allComponentTypes) {
    const dropdown = allComponentTypes[category];
    if (Object.prototype.hasOwnProperty.call(dropdown, Key)) {
      return dropdown[Key];
    }
  }
  return null;
}

export const getEmployeeName = (employeeId, allEmployee) => {
  if (!employeeId || !allEmployee) return "Unknown Employee";
  const employee = allEmployee?.find(
    (emp) => String(emp.employeeUuid).trim() === String(employeeId).trim()
  );
  return employee ? `${employee.employeeFirstName} ${employee.employeeLastName}` : "Unknown Employee";
}

// Helper function to find matching key
export const findMatchingKey = (dropdown, value) =>
  Object.keys(dropdown || {}).find(key => dropdown[key] === value);

// Build dropdown options from given dropdown data
export const buildDropdownOptions = (dropdown) => {
  if (!dropdown) return [];
  return Object.entries(dropdown).map(([key, value], index) => ({
    key: key || index.toString(),
    value: value,
  }));
};

// utils/fileUtils.js

/**
 * Converts a file to base64 string with metadata
 * @param {File} file - The file object to convert
 * @returns {Promise<Object>} - Promise that resolves to object with base64 and metadata
 */
export const convertFileToBase64 = (file, maxSizeInBytes = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Validate file type using MIME type or file extension
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/heic', 'image/heif'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.pdf'];
    const fileExtension = '.' + (file.name || '').split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      reject(new Error('Only JPG, PNG, HEIC, HEIF and PDF files are allowed'));
      return;
    }

    // Check file size only if maxSizeInBytes is provided
    if (maxSizeInBytes && file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxSizeInMB = (maxSizeInBytes / (1024 * 1024)).toFixed(2);
      reject(new Error(`File size (${fileSizeInMB} MB) exceeds the maximum limit of ${maxSizeInMB} MB`));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const base64String = reader.result;
        const fileData = {
          base64: base64String, // Full base64 with data URL prefix
          pureBase64: base64String.split(',')[1], // Pure base64 without prefix
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileSizeKB: Math.round(file.size / 1024),
          lastModified: file.lastModified,
          uploadTimestamp: new Date().toISOString()
        };
        resolve(fileData);
      } catch (error) {
        reject(new Error('Error processing file data'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    // Read the file as data URL (base64)
    reader.readAsDataURL(file);
  });
};


// Utility functions for file handling
export const getFileDisplayName = (file) => {
  return file?.name || 'Uploaded file';
};

export const getFileDisplaySize = (file) => {
  return Math.round((file?.size || 0) / 1024);
};

export const getFileDisplayType = (file) => {
  // Try MIME type first
  if (file?.type && file.type.includes('/')) {
    const mimeType = file.type.split('/')[1];
    if (mimeType) return mimeType.toUpperCase();
  }

  // Fall back to file extension
  if (file?.name && file.name.includes('.')) {
    const extension = file.name.split('.').pop();
    if (extension) return extension.toUpperCase();
  }

  // Final fallback
  return 'FILE';
};

export const isFilePDF = (file) => {
  return file?.type === 'application/pdf' ||
    file?.name?.toLowerCase().endsWith('.pdf');
};

/**
 * Shared file upload processing: validates slots, duplicates, type, size, and converts to base64.
 * @param {File[]} inputFiles - Files from the input element
 * @param {Object[]} existingFiles - Already uploaded file objects (need .name and .size)
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} proofUpload - PROOF_UPLOAD constants from enums
 * @returns {Promise<{validFiles: Object[], hasErrors: boolean}>}
 */
export const processProofFiles = async (inputFiles, existingFiles, dispatch, proofUpload) => {
  let files = Array.from(inputFiles);
  if (!files.length) return { validFiles: [], hasErrors: false };

  // Trim to remaining slots
  const remainingSlots = proofUpload.MAX_FILES - existingFiles.length;
  if (remainingSlots <= 0) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `Maximum ${proofUpload.MAX_FILES} files allowed. Remove a file to upload more.`,
        severity: "warning",
      },
    });
    return { validFiles: [], hasErrors: true };
  }
  if (files.length > remainingSlots) {
    const skipped = files.length - remainingSlots;
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `Only ${remainingSlots} more file${remainingSlots > 1 ? 's' : ''} can be uploaded. ${skipped} file${skipped > 1 ? 's were' : ' was'} skipped.`,
        severity: "warning",
      },
    });
    files = files.slice(0, remainingSlots);
  }

  // Filter out duplicates
  const duplicateFiles = files.filter(file =>
    existingFiles.some(existing => existing.name === file.name && existing.size === file.size)
  );
  if (duplicateFiles.length > 0) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `Duplicate file(s) skipped: ${duplicateFiles.map(f => f.name).join(', ')}`,
        severity: "warning",
      },
    });
    files = files.filter(file =>
      !existingFiles.some(existing => existing.name === file.name && existing.size === file.size)
    );
    if (files.length === 0) return { validFiles: [], hasErrors: true };
  }

  // Validate type and size
  const tooLargeFiles = [];
  const invalidTypeFiles = [];
  const accepted = [];

  for (const file of files) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!proofUpload.ALLOWED_TYPES.includes(file.type) && !proofUpload.ALLOWED_EXTENSIONS.includes(ext)) {
      invalidTypeFiles.push(file.name);
    } else if (file.size > proofUpload.MAX_FILE_SIZE) {
      tooLargeFiles.push(file.name);
    } else {
      accepted.push(file);
    }
  }

  if (tooLargeFiles.length > 0) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `${tooLargeFiles.join(', ')}: ${proofUpload.ERROR_FILE_TOO_LARGE}`,
        severity: "warning",
      },
    });
  }
  if (invalidTypeFiles.length > 0) {
    dispatch({
      type: "SET_NEW_SNACKBAR_MESSAGE",
      payload: {
        message: `${invalidTypeFiles.join(', ')}: ${proofUpload.ERROR_INVALID_TYPE}`,
        severity: "warning",
      },
    });
  }

  if (accepted.length === 0) return { validFiles: [], hasErrors: tooLargeFiles.length > 0 || invalidTypeFiles.length > 0 };

  // Convert to base64
  const validFiles = [];
  for (const file of accepted) {
    try {
      const fileData = await convertFileToBase64(file, proofUpload.MAX_FILE_SIZE);
      validFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        base64Data: fileData.base64,
        pureBase64: fileData.pureBase64,
        fileMetadata: fileData
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  return { validFiles, hasErrors: false };
};

export const convertBufferToString = (bufferData) => {
  try {
    if (bufferData && typeof bufferData === "object" && bufferData.type === "Buffer" && Array.isArray(bufferData.data)) {
      // Convert Buffer data array to string
      const uint8Array = new Uint8Array(bufferData.data);
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(uint8Array);
    }
    return null;
  } catch (error) {
    console.error("Error converting Buffer to string:", error);
    return null;
  }
};

export const handleViewProofClick = (attachmentPath, setFilesToView, setViewerOpen) => {
  try {
    let validFiles = [];

    // Parse attachmentPath - it could be a Buffer, stringified JSON array, or direct base64 data
    let parsedAttachments = [];

    if (typeof attachmentPath === "string") {
      try {
        // Try to parse as JSON first (new format with base64 data)
        parsedAttachments = JSON.parse(attachmentPath);
      } catch {
        // If JSON parsing fails, treat it as a direct URL (legacy format)
        parsedAttachments = [attachmentPath];
      }
    } else if (attachmentPath && typeof attachmentPath === "object" && attachmentPath.type === "Buffer") {
      // Handle Buffer data from backend
      const bufferString = convertBufferToString(attachmentPath);
      if (bufferString) {
        try {
          parsedAttachments = JSON.parse(bufferString);
        } catch {
          parsedAttachments = [bufferString];
        }
      }
    } else if (Array.isArray(attachmentPath)) {
      parsedAttachments = attachmentPath;
    }

    // Process each attachment
    parsedAttachments.forEach((item, index) => {
      if (item && typeof item === "object" && item.base64) {
        // New format: base64 data with metadata
        validFiles.push({
          url: item.base64, // Use the base64 data URL
          fileName: item.fileName || `attachment_${index + 1}`,
          fileType: item.fileType || 'application/octet-stream',
          isBase64: true
        });
      } else if (item && typeof item === "string" && item.trim() !== "") {
        // Legacy format: direct URL or base64 string
        if (item.startsWith('data:')) {
          // Direct base64 data URL
          validFiles.push({
            url: item,
            fileName: `attachment_${index + 1}`,
            fileType: item.split(';')[0].split(':')[1] || 'application/octet-stream',
            isBase64: true
          });
        } else if (item.match(/^[A-Za-z0-9+/=]+$/)) {
          // Plain base64 string (no data URL prefix) - assume it's an image
          validFiles.push({
            url: `data:image/jpeg;base64,${item}`,
            fileName: `proof_${index + 1}.jpg`,
            fileType: 'image/jpeg',
            isBase64: true
          });
        } else {
          // Regular URL
          validFiles.push({
            url: item,
            fileName: item.split('/').pop() || `attachment_${index + 1}`,
            fileType: 'application/octet-stream',
            isBase64: false
          });
        }
      }
    });

    if (validFiles.length === 0) {
      alert("No valid documents found to view.");
      return;
    }

    setFilesToView(validFiles);
    setViewerOpen(true);
  } catch (error) {
    console.error("Error opening document:", error);
    alert("An error occurred while trying to open the document.");
  }
};
