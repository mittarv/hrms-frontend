export const removeAppendedSasToken = (url) => {
    try {
        const parts = url.split("?");
        return parts[0];
    } catch (error) {
        return url;
    }
}

export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    // Handle both ISO string format and regular date strings
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
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