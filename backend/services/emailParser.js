/**
 * emailParser.js
 * Parses forwarded bank transaction-alert emails. Reuses the date logic from
 * smsParser.js but has its own merchant/amount patterns because email phrasing
 * differs from SMS ("towards", "for purchase at" instead of just "to"/"at"),
 * and emails often arrive as HTML that needs stripping first.
 */
import { parseDateStr } from "./smsParser.js";

// Strips HTML tags/entities down to plain text so regexes can work on it,
// whether the user forwards the HTML body or the plain-text version.
function stripHtml(input) {
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses a single forwarded email (subject + body, or just body) into
 * structured transaction data. Same return shape as parseSMS() so both
 * can feed the same categorizer + Transaction model.
 */
function parseEmail(rawInput) {
  const text = stripHtml(rawInput);

  const amountMatch = text.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null;

  const isCredit = /credited|received|refunded/i.test(text);
  const isDebit = /debited|spent|paid|purchase|transaction of/i.test(text);
  const type = isCredit && !isDebit ? "credit" : "debit";

  let merchant = null;
  const merchantPatterns = [
    // UPI-style merchant reference, same as SMS
    /UPI\/P2[MA]\/(?:\d+\/)?([A-Za-z][A-Za-z0-9&.'\-\s]{1,35}?)(?=\s+on\b|\s+dated\b|\.|,|$)/i,
    // Email-specific phrasing: "towards SWIGGY", "for purchase at AMAZON", "paid to UBER"
    /\b(?:towards|for purchase at|paid to|to|at)\b\s+([A-Za-z][A-Za-z0-9&.'\-\s]{1,35}?)(?=\s+on\s|\s+via\s|\s*UPI|\.\s|\.$|,|\s+Ref|\s+dated|\s+for|$)/i,
    /\b(?:towards|to|at)\b\s+([A-Za-z0-9][A-Za-z0-9&.'\-\s]{1,35})/i,
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

  const acctMatch = text.match(
    /A\/c\s*[Xx*]*(\d{2,6})|account\s*(?:no\.?|number)?\s*(?:ending)?\s*[Xx*]*(\d{2,6})/i
  );
  const account = acctMatch ? acctMatch[1] || acctMatch[2] : null;

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

export { parseEmail, stripHtml };
