import { useState, useEffect, useCallback } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import mammoth from "mammoth";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { removeAppendedSasToken } from "../utils/helper";
import ArrowRight from "../../assets/icons/right_arrow.svg";
import ArrowLeft from "../../assets/icons/left_arrow.svg";
import Download_icon from "../../assets/icons/upload_icon_blue.svg";

const FileViewer = ({ fileUrls, open, onClose, initialIndex = 0 }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [currentFileIndex, setCurrentFileIndex] = useState(initialIndex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Normalize fileUrls to always be an array and handle both old (string) and new (object) formats
  const normalizedFiles = (() => {
    const files = Array.isArray(fileUrls) ? fileUrls : [fileUrls].filter(Boolean);
    return files.map((file, index) => {
      if (typeof file === "object" && file.url) {
        // New format: file object with metadata
        return file;
      } else if (typeof file === "string") {
        // Legacy format: direct URL string
        return {
          url: file,
          fileName: file.split("/").pop() || `file_${index + 1}`,
          fileType: 'application/octet-stream',
          isBase64: file.startsWith('data:')
        };
      }
      return null;
    }).filter(Boolean);
  })();

  const currentFile = normalizedFiles[currentFileIndex];
  const currentFileUrl = currentFile?.url;
  const hasMultipleFiles = normalizedFiles.length > 1;

  const getFileType = (file) => {
    if (!file) return null;
    
    // Handle base64 data URLs
    if (file.isBase64 && file.url.startsWith('data:')) {
      const mimeType = file.url.split(';')[0].split(':')[1];
      if (mimeType.includes('pdf')) return "pdf";
      if (mimeType.includes('image')) return "image";
      if (mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
          mimeType.includes('application/msword')) return "docx";
      return null;
    }
    
    // Handle file type from metadata
    if (file.fileType) {
      if (file.fileType.includes('pdf')) return "pdf";
      if (file.fileType.includes('image')) return "image";
      if (file.fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
          file.fileType.includes('application/msword')) return "docx";
    }
    
    // Fallback: handle by URL/filename
    const url = file.url || '';
    const removedSass = removeAppendedSasToken(url);
    const fileName = file.fileName || removedSass.split("/").pop();
    const match = fileName.match(
      /\.(pdf|docx|doc|jpg|jpeg|png|gif|bmp|webp)(?=[._]|$)/i
    );
    if (!match) return null;
    
    const extension = match[1].toLowerCase();
    if (["pdf"].includes(extension)) return "pdf";
    if (["doc", "docx"].includes(extension)) return "docx";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) return "image";
    
    return null;
  };

  const fileType = getFileType(currentFile);

  const handleDocxFile = useCallback(async () => {
    if (!currentFile?.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let arrayBuffer;
      
      if (currentFile.isBase64 && currentFile.url.startsWith('data:')) {
        // Handle base64 data
        const base64Data = currentFile.url.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      } else {
        // Handle regular URL
        const response = await fetch(currentFile.url);
        if (!response.ok) {
          throw new Error(`File not found: ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      }
      
      const options = {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "b => strong",
          "i => em",
          "u => underline",
          "strike => del",
          "ul => ul",
          "ol => ol",
          "li => li",
        ],
      };
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      setHtmlContent(result.value || "<p>Unable to load the document</p>");
    } catch (error) {
      console.error("Error reading DOCX file:", error);
      setError("Failed to load document. The file may not exist or be accessible.");
      setHtmlContent("<p style='color: red;'>Failed to load document.</p>");
    } finally {
      setLoading(false);
    }
  }, [currentFile]);

  useEffect(() => {
    setPageNumber(1); // Reset page number when switching files
    setError(null);
    
    if (fileType === "docx") {
      handleDocxFile();
    }
  }, [currentFileIndex, fileType, handleDocxFile]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    setError("Failed to load PDF. The file may not exist or be accessible.");
  };

  const goToPrevPage = () => {
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, numPages));
  };

  const goToPrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const goToNextFile = () => {
    if (currentFileIndex < normalizedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const getCurrentFileName = () => {
    if (!currentFile) return "Unknown file";
    return currentFile.fileName || removeAppendedSasToken(currentFile.url).split("/").pop();
  };

  const handleDownload = async () => {
    if (!currentFile?.url) return;
    
    try {
      let blob;
      
      if (currentFile.isBase64 && currentFile.url.startsWith('data:')) {
        // Handle base64 data
        const response = await fetch(currentFile.url);
        blob = await response.blob();
      } else {
        // Handle regular URL
        const response = await fetch(currentFile.url);
        blob = await response.blob();
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getCurrentFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderFileContent = () => {
    if (error) {
      return (
        <Box textAlign="center" p={4}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={2}>
            The file may have been deleted or moved.
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box textAlign="center" p={4}>
          <Typography>Loading file...</Typography>
        </Box>
      );
    }

    if (fileType === "pdf") {
      return (
        <div>
          <Document 
            file={currentFileUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Typography>Loading PDF...</Typography>}
          >
            <Page pageNumber={pageNumber} />
          </Document>
          <div className="pdf-buttons" style={{ marginTop: '10px', textAlign: 'center' }}>
            <Button onClick={goToPrevPage} disabled={pageNumber <= 1} size="small" style ={{backgroundColor: '#f0f0f0'}}>
              Previous Page
            </Button>
            <Typography variant="body2" component="span" mx={2}>
              Page {pageNumber} of {numPages || "..."}
            </Typography>
            <Button onClick={goToNextPage} disabled={pageNumber >= numPages} size="small" style ={{backgroundColor: '#f0f0f0'}}>
              Next Page
            </Button>
          </div>
        </div>
      );
    } else if (fileType === "docx") {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ overflow: "auto", maxHeight: "70vh", padding: '10px' }}
        />
      );
    } else if (fileType === "image") {
      return (
        <img
          src={currentFileUrl}
          alt="Document"
          style={{ maxWidth: "100%", height: "auto" }}
          onError={() => setError("Failed to load image. The file may not exist.")}
        />
      );
    } else {
      return (
        <Box textAlign="center" p={4}>
          <Typography color="error">Unsupported file type</Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: PDF, DOCX, DOC, JPG, JPEG, PNG, GIF, BMP, WEBP
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "white",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header with file navigation */}
      {hasMultipleFiles && (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between" 
          p={2} 
          borderBottom={1} 
          borderColor="grey.300"
        >
          <IconButton onClick={goToPrevFile} disabled={currentFileIndex === 0}>
            <img src={ArrowLeft}/>
          </IconButton>
          
          <Box textAlign="center" flex={1}>
            <Typography variant="h6" noWrap>
              {getCurrentFileName()}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              File {currentFileIndex + 1} of {normalizedFiles.length}
            </Typography>
          </Box>
          
          <IconButton onClick={goToNextFile} disabled={currentFileIndex === normalizedFiles.length - 1}>
            <img src={ArrowRight}/>
          </IconButton>
        </Box>
      )}

      <DialogContent style={{ backgroundColor: "white", color: "black", padding: '20px' }}>
        {currentFile?.url ? renderFileContent() : <Typography>No file to display</Typography>}
      </DialogContent>

      <DialogActions style={{ backgroundColor: "white", padding: '16px' }}>
        {!hasMultipleFiles && (
          <Typography variant="body2" color="textSecondary" flex={1}>
            {getCurrentFileName()}
          </Typography>
        )}
        <IconButton onClick={handleDownload} color="primary" title="Download file">
            <img src={Download_icon} alt="Download" height="24px" width= "24px"/>
        </IconButton>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileViewer;