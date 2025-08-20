// Utility functions for the TenderMatch AI application

/**
 * Create a page URL based on the page name
 * @param {string} pageName - The name of the page
 * @returns {string} - The URL path for the page
 */
export function createPageUrl(pageName) {
  const routes = {
    'Dashboard': '/',
    'Portfolio': '/portfolio',
    'Opportunities': '/opportunities',
    'TenderAnalysis': '/analysis',
    'Integrations': '/integrations',
    'AgentSettings': '/settings'
  };
  
  return routes[pageName] || '/';
}

/**
 * Format currency values
 * @param {number} amount - The amount to format  
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format large numbers (e.g., 1000000 -> 1M)
 * @param {number} num - The number to format
 * @returns {string} - Formatted number string
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined) return 'N/A';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Calculate days until deadline
 * @param {string|Date} deadline - The deadline date
 * @returns {number} - Number of days until deadline
 */
export function daysUntilDeadline(deadline) {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get status color based on deadline urgency
 * @param {string|Date} deadline - The deadline date
 * @returns {string} - CSS color class
 */
export function getDeadlineStatus(deadline) {
  const days = daysUntilDeadline(deadline);
  
  if (days === null) return 'text-slate-500';
  if (days < 0) return 'text-red-600';
  if (days <= 7) return 'text-orange-600';
  if (days <= 30) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Get match score color
 * @param {number} score - Match score (0-100)
 * @returns {string} - CSS color class
 */
export function getMatchScoreColor(score) {
  if (score >= 85) return 'text-green-600 bg-green-100';
  if (score >= 70) return 'text-blue-600 bg-blue-100';
  if (score >= 50) return 'text-yellow-600 bg-yellow-100';
  return 'text-slate-600 bg-slate-100';
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a random UUID v4
 * @returns {string} - UUID string
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}