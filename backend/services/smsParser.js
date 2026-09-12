/**
 * smsParser.js
 * Pure regex-based extraction of transaction details from a bank/UPI SMS.
 * No external dependencies — deliberately rule-based so it's fast, free,
 * and auditable (you can see exactly why a field was extracted a certain way).
 */

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseDateStr(str) {
  if (!str) return null;

  // Format: 04-Sep-26 or 04/Sep/2026
  let m = str.match(/(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{2,4})/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    const month = MONTH_MAP[m[2].toLowerCase()];
    if (month !== undefined) return new Date(year, month, parseInt(m[1], 10));
  }

  // Format: 04-09-2026 or 04/09/26
  m = str.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (m) {
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }

  return null;
}

/**
 * Splits a block of raw text into individual SMS messages.
 * Handles two paste styles: messages separated by a blank line,
 * or messages run together with no separator (splits before each "Rs."/"INR").
 */
function splitMessages(rawText) {
  const trimmed = (rawText || "").trim();
  if (!trimmed) return [];

  let parts = trimmed.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean);

  if (parts.length === 1) {
    const sub = parts[0]
      .split(/(?=(?:Rs\.?|INR)\s?\d)/i)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sub.length > 1) parts = sub;
  }

  return parts;
}

/**
 * Parses a single SMS string into structured transaction data.
 * Returns { amount, merchant, type, date, account, valid, raw }
 */
function parseSMS(text) {
  const amountMatch = text.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

  const isCredit = /credited/i.test(text);
  const isDebit = /debited|spent|paid/i.test(text);
  const type = isCredit && !isDebit ? "credit" : "debit";

  let merchant = null;
  const merchantPatterns = [
    // "UPI/P2M/xxxxxxx/AMAZON RETAIL" or "UPI/P2M/AMAZON RETAIL" — common UPI merchant-payment format
    /UPI\/P2[MA]\/(?:\d+\/)?([A-Za-z][A-Za-z0-9&.'\-\s]{1,35}?)(?=\s+on\b|\s+dated\b|\.|,|$)/i,
    // "debited ... to SWIGGY BANGALORE on 04-Sep-26" / "spent ... at UBER"
    /\b(?:to|at)\b\s+([A-Za-z][A-Za-z0-9&.'\-\s]{1,35}?)(?=\s+on\s|\s+via\s|\s*UPI|\.\s|\.$|,|\s+Ref|\s+dated|\s+txn|$)/i,
    /\b(?:to|at)\b\s+([A-Za-z0-9][A-Za-z0-9&.'\-\s]{1,35})/i,
  ];
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match) {
      merchant = match[1].trim().replace(/\s+/g, " ").replace(/\.$/, "");
      break;
    }
  }
  if (!merchant) merchant = "UNKNOWN MERCHANT";

  const dateMatch = text.match(/(\d{1,2}[-\/][A-Za-z]{3}[-\/]\d{2,4}|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/);
  const dateObj = parseDateStr(dateMatch ? dateMatch[1] : null) || new Date();

  const acctMatch = text.match(/A\/c\s*[Xx*]*(\d{2,6})/i);
  const account = acctMatch ? acctMatch[1] : null;

  return {
    amount,
    merchant,
    type,
    date: dateObj,
    account,
    raw: text,
    valid: amount !== null,
  };
}

export { parseSMS, splitMessages, parseDateStr };
