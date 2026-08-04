/**
 * Date Formatter Utility
 */

/**
 * Format a date to a human-readable local string (WIB).
 * @param {Date|string} date
 * @returns {string} e.g. "Sabtu, 2 Agustus 2026, 15:20"
 */
const formatToLocale = (date) => {
  return new Date(date).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a date to ISO string with timezone offset.
 * @param {Date|string} date
 * @returns {string}
 */
const formatToISO = (date) => new Date(date).toISOString();

/**
 * Get current Unix timestamp in seconds.
 * @returns {number}
 */
const unixNow = () => Math.floor(Date.now() / 1000);

/**
 * Add minutes to a Date object.
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

module.exports = { formatToLocale, formatToISO, unixNow, addMinutes };
