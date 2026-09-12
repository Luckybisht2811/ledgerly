/**
 * subscriptionDetector.js
 *
 * Detects recurring subscriptions (Netflix, Spotify, gym memberships, etc.)
 * from a user's transaction history — without any external subscription API.
 *
 * Algorithm:
 * 1. Group all debit transactions by merchant name (a hash-map grouping, O(n)).
 * 2. For each merchant with 2+ occurrences, sort by date and compute the
 *    gaps (in days) between consecutive charges.
 * 3. A merchant is flagged as a subscription if:
 *    - the charged amount is consistent across occurrences (within 5% tolerance
 *      — handles minor price changes/rounding), AND
 *    - the gap between charges is consistently close to a monthly cycle
 *      (25–35 days, averaged, with each individual gap within 5 days of the
 *      average — so one-off same-amount purchases like two separate ₹599
 *      Amazon orders a week apart don't get flagged).
 */

function detectSubscriptions(transactions) {
  const groups = new Map();

  for (const tx of transactions) {
    const key = tx.merchant.toUpperCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(tx);
  }

  const subscriptions = [];

  for (const [merchant, txs] of groups) {
    if (txs.length < 2) continue;

    const sorted = [...txs].sort((a, b) => new Date(a.date) - new Date(b.date));

    const amounts = sorted.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountConsistent = avgAmount > 0 && amounts.every((a) => Math.abs(a - avgAmount) / avgAmount <= 0.05);

    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      const days = (new Date(sorted[i].date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24);
      gaps.push(days);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const gapConsistent = gaps.every((g) => Math.abs(g - avgGap) <= 5);
    const isMonthlyCadence = avgGap >= 25 && avgGap <= 35;

    if (amountConsistent && gapConsistent && isMonthlyCadence) {
      subscriptions.push({
        merchant,
        averageAmount: Math.round(avgAmount),
        cadenceDays: Math.round(avgGap),
        occurrences: sorted.length,
        lastChargedOn: sorted[sorted.length - 1].date,
        category: sorted[sorted.length - 1].category,
      });
    }
  }

  return subscriptions.sort((a, b) => b.averageAmount - a.averageAmount);
}

export { detectSubscriptions };
