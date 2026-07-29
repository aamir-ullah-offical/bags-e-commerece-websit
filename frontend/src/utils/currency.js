/**
 * Centralized PKR currency formatting.
 * All prices in this application are stored and displayed in Pakistani Rupees (PKR).
 */

/**
 * Format a number as Pakistani Rupees.
 * Output examples: "Rs. 12,500" | "Rs. 1,24,999" | "Rs. 450"
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatPKR(amount) {
  if (amount == null || isNaN(amount)) return "Rs. 0";
  const rounded = Math.round(amount);
  return "Rs. " + rounded.toLocaleString("en-PK");
}

/**
 * Format a price difference (savings) as PKR, always positive.
 * Used in "Save Rs. X" badges.
 *
 * @param {number} original
 * @param {number} discounted
 * @returns {string}
 */
export function formatSavings(original, discounted) {
  return formatPKR(Math.round(original - discounted));
}

/**
 * Compute the sale price after discount.
 *
 * @param {number} price
 * @param {number} discount  percentage (0-100)
 * @returns {number}
 */
export function calcSalePrice(price, discount = 0) {
  return Math.round(price * (1 - discount / 100));
}

export const SHIPPING_THRESHOLD = 20000; // Free shipping above Rs. 20,000
export const SHIPPING_COST      = 450;   // Rs. 450 flat shipping fee
export const TAX_RATE           = 0.17;  // 17% GST (Pakistan standard)
