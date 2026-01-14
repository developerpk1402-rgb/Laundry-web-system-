
/**
 * LavanFlow OS Security Suite
 * OWASP A03:2021 - Injection Prevention
 */

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Basic XSS prevention: Escape HTML entities
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  
  const reg = /[&<>"'/]/ig;
  return input.replace(reg, (match) => map[match]);
};

export const validateRNC = (rnc: string): boolean => {
  // Dominican Republic RNC validation (9 or 11 digits)
  const rncRegex = /^(\d{9}|\d{11})$/;
  return rncRegex.test(rnc.replace(/-/g, ''));
};

export const validatePhone = (phone: string): boolean => {
  // Standard DR phone validation
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone);
};
