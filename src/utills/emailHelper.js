const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const domainCheck = /@[\w.-]+\.[A-Za-z]{2,}$/;
export const checkEmailType = (email) => {
  if (emailRegex.test(email) && domainCheck.test(email)) {
    return true;
  } else {
    return false;
  }
};
