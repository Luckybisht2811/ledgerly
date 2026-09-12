/**
 * categorizer.js
 * Rule-based "NLP-lite" engine: matches merchant names against curated
 * keyword lists to assign a spending category. Falls back to per-user
 * learned rules (CategoryRule collection) first, since those come from
 * explicit user corrections and should always win over the defaults.
 */

const DEFAULT_RULES = [
  {
    category: "Food",
    keywords: ["SWIGGY", "ZOMATO", "DOMINOS", "PIZZA", "MCDONALD", "KFC", "BURGER", "CAFE", "RESTAURANT", "EATERY", "FAASOS", "BEHROUZ", "STARBUCKS", "DUNZO"],
  },
  {
    category: "Groceries",
    keywords: ["BIGBASKET", "BLINKIT", "ZEPTO", "GROFERS", "DMART", "INSTAMART", "SUPERMARKET", "GROCERY", "RELIANCE FRESH"],
  },
  {
    category: "Travel",
    keywords: ["UBER", "OLA", "RAPIDO", "IRCTC", "REDBUS", "INDIGO", "AIRINDIA", "SPICEJET", "MERU", "YATRA", "MAKEMYTRIP", "PETROL", "FUEL", "METRO", "IOCL", "HPCL", "BPCL"],
  },
  {
    category: "Shopping",
    keywords: ["AMAZON", "FLIPKART", "MYNTRA", "AJIO", "NYKAA", "MEESHO", "RELIANCE DIGITAL", "CROMA", "DECATHLON", "IKEA"],
  },
  {
    category: "Bills & Utilities",
    keywords: ["AIRTEL", "JIO", "VODAFONE", "BSNL", "ELECTRICITY", "BESCOM", "TATA POWER", "BROADBAND", "ACT FIBERNET", "GAS", "DTH", "TATASKY", "RECHARGE"],
  },
  {
    category: "Entertainment",
    keywords: ["NETFLIX", "HOTSTAR", "PRIME VIDEO", "SPOTIFY", "BOOKMYSHOW", "PVR", "INOX", "SONYLIV", "ZEE5", "GAANA", "JIOCINEMA"],
  },
  {
    category: "Health",
    keywords: ["APOLLO", "PHARMEASY", "PRACTO", "MEDPLUS", "NETMEDS", "HOSPITAL", "CLINIC", "DIAGNOSTIC", "PHARMACY", "1MG"],
  },
];

/**
 * Categorizes a merchant name.
 * @param {string} merchant - raw merchant string extracted from SMS
 * @param {Map<string,string>|Object} learnedRules - merchant(upper) -> category, from CategoryRule collection
 * @returns {{ category: string, confident: boolean }}
 */
function categorize(merchant, learnedRules = {}) {
  const upperMerchant = merchant.toUpperCase();

  // 1. User's own corrections take priority
  const learned = learnedRules instanceof Map ? learnedRules.get(upperMerchant) : learnedRules[upperMerchant];
  if (learned) {
    return { category: learned, confident: true };
  }

  // 2. Default keyword rules
  const padded = ` ${upperMerchant} `;
  for (const rule of DEFAULT_RULES) {
    if (rule.keywords.some((keyword) => padded.includes(keyword))) {
      return { category: rule.category, confident: true };
    }
  }

  // 3. No match — flag for user review
  return { category: "Other", confident: false };
}

export { categorize, DEFAULT_RULES };
