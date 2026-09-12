import Transaction from "../models/Transaction.js";
import CategoryRule from "../models/CategoryRule.js";
import { parseEmail } from "../services/emailParser.js";
import { categorize } from "../services/categorizer.js";

// POST /api/email/parse
// Body: { text: "forwarded email body (plain text or HTML)" }
// One email = one transaction (unlike /api/sms/parse which handles batches,
// since users typically forward one bank alert email at a time).
async function parseAndSaveEmail(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Email text bhejo" });
    }

    const rules = await CategoryRule.find({ user: req.user._id });
    const learnedMap = new Map(rules.map((r) => [r.merchant, r.category]));

    const parsed = parseEmail(text);
    if (!parsed.valid) {
      return res.status(422).json({
        message: "Is email se amount nahi nikal paya — format samajh nahi aaya",
      });
    }

    const { category, confident } = categorize(parsed.merchant, learnedMap);

    try {
      const tx = await Transaction.create({
        user: req.user._id,
        amount: parsed.amount,
        merchant: parsed.merchant,
        category,
        type: parsed.type,
        date: parsed.date,
        account: parsed.account,
        rawSms: parsed.raw,
        source: "email",
        confident,
      });
      return res.status(201).json({ message: "1 transaction added from email", added: tx });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ message: "Ye email pehle se process ho chuki hai (duplicate)", duplicate: true });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: "Email parse karne mein error aaya", error: err.message });
  }
}

export { parseAndSaveEmail };
