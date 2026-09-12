import Transaction from "../models/Transaction.js";
import CategoryRule from "../models/CategoryRule.js";
import { parseSMS, splitMessages } from "../services/smsParser.js";
import { categorize } from "../services/categorizer.js";

// POST /api/sms/parse
// Body: { text: "raw SMS or multiple SMS separated by blank lines" }
async function parseAndSave(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "SMS text bhejo" });
    }

    // Load this user's learned merchant -> category corrections
    const rules = await CategoryRule.find({ user: req.user._id });
    const learnedMap = new Map(rules.map((r) => [r.merchant, r.category]));

    const chunks = splitMessages(text);
    const results = { added: [], duplicates: 0, unparsed: 0 };

    for (const chunk of chunks) {
      const parsed = parseSMS(chunk);

      if (!parsed.valid) {
        results.unparsed += 1;
        continue;
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
          confident,
        });
        results.added.push(tx);
      } catch (err) {
        // duplicate key error = same SMS already saved for this user
        if (err.code === 11000) {
          results.duplicates += 1;
        } else {
          throw err;
        }
      }
    }

    res.status(201).json({
      message: `${results.added.length} transaction(s) added, ${results.duplicates} duplicate(s) skipped, ${results.unparsed} unparsed`,
      ...results,
    });
  } catch (err) {
    res.status(500).json({ message: "SMS parse karne mein error aaya", error: err.message });
  }
}

export { parseAndSave };
