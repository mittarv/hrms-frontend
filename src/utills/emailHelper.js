const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Get allowed email domain from environment variable
const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || 'mittarv.com';
const domainCheck = new RegExp(`@${allowedDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

export const checkEmailType = (email) => {
  if (emailRegex.test(email) && domainCheck.test(email)) {
    return true;
  } else {
    return false;
  }
};

// Export the allowed domain for use in other files
export const getAllowedEmailDomain = () => allowedDomain;
