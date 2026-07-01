
export const ATTENDANCE_STATUS = {
    WORKING: "working",
    HALF_DAY: "half_day",
    ON_LEAVE: "on_leave",
};

export const PROOF_UPLOAD = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    MAX_FILES: 5,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.pdf'],
    ACCEPT_STRING: '.jpg,.jpeg,.png,.heic,.heif,.pdf',
    FILE_HINT: 'Upload PDF,PNG,JPEG or HEIC (up to 5 files).',
    ERROR_INVALID_TYPE: 'Only JPG, PNG, HEIC and PDF files are allowed',
    ERROR_FILE_TOO_LARGE: 'File size must be less than 10 MB',
};

export const ExtraWorkRequestStatus = {
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const OFFBOARDING_STATUS = {
    NOT_INITIATED: "not_initiated",
    INITIATED: "initiated",
    APPROVED: "approved",
    ON_HOLD: "on_hold",
    REJECTED: "rejected",
};