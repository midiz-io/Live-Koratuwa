/**
 * Timezone Utility for Sri Lankan Time (Asia/Colombo)
 * UTC+5:30
 */

/**
 * Get current timestamp in Sri Lankan timezone
 * @returns {string} ISO string representing Sri Lankan time
 */
function getSriLankanTimestamp() {
  const now = new Date();
  
  // Sri Lanka is UTC+5:30 (330 minutes ahead of UTC)
  const sriLankaOffsetMinutes = 330; // 5 hours 30 minutes
  
  // Add the offset to UTC time
  const sriLankaTime = new Date(now.getTime() + sriLankaOffsetMinutes * 60 * 1000);
  
  return sriLankaTime.toISOString();
}

/**
 * Convert any timestamp to Sri Lankan timezone
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string representing Sri Lankan time
 */
function toSriLankanTime(date) {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  const sriLankaOffsetMinutes = 330;
  const sriLankaTime = new Date(inputDate.getTime() + sriLankaOffsetMinutes * 60 * 1000);
  
  return sriLankaTime.toISOString();
}

/**
 * Format timestamp for Sri Lankan timezone display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted string (YYYY-MM-DD HH:MM:SS Asia/Colombo)
 */
function formatSriLankanTime(date) {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  // Add Sri Lanka offset
  const sriLankaOffsetMinutes = 330;
  const sriLankaTime = new Date(inputDate.getTime() + sriLankaOffsetMinutes * 60 * 1000);
  
  const year = sriLankaTime.getUTCFullYear();
  const month = String(sriLankaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(sriLankaTime.getUTCDate()).padStart(2, '0');
  const hours = String(sriLankaTime.getUTCHours()).padStart(2, '0');
  const minutes = String(sriLankaTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(sriLankaTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (Asia/Colombo)`;
}

module.exports = {
  getSriLankanTimestamp,
  toSriLankanTime,
  formatSriLankanTime
};
