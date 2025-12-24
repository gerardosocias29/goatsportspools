import moment from 'moment-timezone';

/**
 * Format a UTC datetime string for display in user's local timezone
 * UTC time from backend -> converted to user's browser timezone -> displayed correctly
 * @param {string} dateString - UTC datetime string from backend
 * @returns {string} - Formatted date/time (e.g., "Thu, Dec 25, 2025, 1:30 PM")
 */
export const formatDateTimeUS = (dateString) => {
  if (!dateString) return 'TBD';
  // Parse as UTC, then convert to user's local timezone (auto-detected by moment)
  return moment.utc(dateString).local().format('ddd, MMM D, YYYY, h:mm A');
};

/**
 * Format a UTC datetime string as date only in user's local timezone
 * @param {string} dateString - UTC datetime string from backend
 * @returns {string} - Formatted date (e.g., "Dec 25, 2025")
 */
export const formatDateUS = (dateString) => {
  if (!dateString) return 'TBD';
  return moment.utc(dateString).local().format('MMM D, YYYY');
};

/**
 * Format a UTC datetime string as time only in user's local timezone
 * @param {string} dateString - UTC datetime string from backend
 * @returns {string} - Formatted time (e.g., "1:30 PM")
 */
export const formatTimeUS = (dateString) => {
  if (!dateString) return 'TBD';
  return moment.utc(dateString).local().format('h:mm A');
};

/**
 * Format a UTC datetime string as a short date/time in user's local timezone
 * @param {string} dateString - UTC datetime string from backend
 * @returns {string} - Short formatted date/time (e.g., "Dec 25, 1:30 PM")
 */
export const formatShortDateTimeUS = (dateString) => {
  if (!dateString) return 'TBD';
  return moment.utc(dateString).local().format('MMM D, h:mm A');
};

/**
 * Convert a local datetime input to UTC ISO string for backend
 * User enters time in their local timezone -> converted to UTC for storage
 * @param {string} localDateString - Local datetime string from input
 * @returns {string|null} - UTC ISO string or null
 */
export const toUTCString = (localDateString) => {
  if (!localDateString) return null;
  // Parse as local time, convert to UTC
  return moment(localDateString).utc().toISOString();
};

/**
 * Check if a UTC datetime has passed
 * @param {string} dateString - UTC datetime string
 * @returns {boolean} - True if the datetime has passed
 */
export const hasPassedUS = (dateString) => {
  if (!dateString) return false;
  return moment.utc(dateString).isBefore(moment());
};

/**
 * Get relative time from now for a UTC datetime
 * @param {string} dateString - UTC datetime string
 * @returns {string} - Relative time (e.g., "in 2 hours", "3 days ago")
 */
export const fromNowUS = (dateString) => {
  if (!dateString) return 'TBD';
  return moment.utc(dateString).fromNow();
};

export default {
  formatDateTimeUS,
  formatDateUS,
  formatTimeUS,
  formatShortDateTimeUS,
  toUTCString,
  hasPassedUS,
  fromNowUS,
};
