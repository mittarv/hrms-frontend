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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Only JPG, PNG, and PDF files are allowed'));
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