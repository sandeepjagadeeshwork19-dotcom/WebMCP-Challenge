/**
 * Indian-format currency rendering (lakh / crore digit grouping), shared by the
 * pure domain layer and the UI so every money string reads the same way.
 *
 * The fund and all costs are hypothetical Indian rupees. The internal amounts
 * are plain integers; only the display is localised.
 */

export function inr(amount: number): string {
  const negative = amount < 0;
  const digits = Math.abs(Math.round(amount)).toString();
  let grouped = digits;
  if (digits.length > 3) {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    grouped = `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}`;
  }
  return `${negative ? "-" : ""}₹${grouped}`;
}
