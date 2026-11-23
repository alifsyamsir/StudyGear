/**
 * Validation utilities for StudyGear
 */

export function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

export function isValidNumber(val, min = 0) {
  const num = Number(val);
  return !isNaN(num) && num >= min;
}

export function isValidInteger(val, min = 0) {
  const num = Number(val);
  return Number.isInteger(num) && num >= min;
}

export function isValidEmail(email) {
  if (!isNonEmptyString(email)) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}
