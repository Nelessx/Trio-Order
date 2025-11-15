# Support and Confidence - Detailed Explanation

## 📊 Understanding Support: 3% vs 30%

### What is Support?

**Support** measures how frequently an itemset (group of items) appears in all transactions.

**Formula:**

```
Support = (Number of transactions containing itemset) / (Total number of transactions)
```

### Example: 3% Support vs 30% Support

Let's say you have **100 delivered orders** in your database:

#### **3% Support (0.03)**

- An item must appear in **at least 3 out of 100 orders** (3%)
- Very **lenient** threshold
- Finds **many patterns**, including rare combinations
- Example: If "Chicken Biryani" appears in 5 orders → Support = 5/100 = 5% ✓ (passes 3% threshold)

#### **30% Support (0.3)**

- An item must appear in **at least 30 out of 100 orders** (30%)
- Very **strict** threshold
- Finds **fewer but stronger patterns**
- Example: If "Chicken Biryani" appears in 5 orders → Support = 5/100 = 5% ✗ (fails 30% threshold)

### Comparison Table

| Support Threshold | Minimum Orders (out of 100) | Pattern Discovery                   | Use Case                            |
| ----------------- | --------------------------- | ----------------------------------- | ----------------------------------- |
| **3% (0.03)**     | 3 orders                    | Finds many patterns (common + rare) | New system, small database          |
| **5% (0.05)**     | 5 orders                    | Balanced approach                   | Medium database                     |
| **10% (0.1)**     | 10 orders                   | Focuses on common patterns          | Large database                      |
| **30% (0.3)**     | 30 orders                   | Only very common patterns           | Very large database, strict quality |

### Real-World Example

**Scenario:** You have 100 delivered orders

**Orders containing "Chicken Biryani":**

- Order 1: [Chicken Biryani, Raita]
- Order 2: [Chicken Biryani, Raita, Lassi]
- Order 3: [Chicken Biryani]
- Order 4: [Chicken Biryani, Naan]
- Order 5: [Chicken Biryani, Raita]

**Support Calculation:**

- "Chicken Biryani" appears in 5 orders
- Support = 5/100 = 0.05 (5%)

**Result:**

- ✅ **Passes 3% threshold** (5% > 3%)
- ✅ **Passes 5% threshold** (5% = 5%)
- ❌ **Fails 30% threshold** (5% < 30%)

**What This Means:**

- With **3% support**: "Chicken Biryani" is considered frequent → algorithm will find patterns
- With **30% support**: "Chicken Biryani" is NOT considered frequent → algorithm will ignore it

---

## 🎯 Impact on Recommendations

### With 3% Support

**Advantages:**

- ✅ Finds patterns even with small order history
- ✅ Discovers rare but interesting combinations
- ✅ More recommendations available
- ✅ Works well with < 50 orders

**Disadvantages:**

- ❌ May include noise (random combinations)
- ❌ Less reliable patterns
- ❌ Too many recommendations (some irrelevant)

### With 30% Support

**Advantages:**

- ✅ Only very strong, reliable patterns
- ✅ High-quality recommendations
- ✅ No noise from rare combinations
- ✅ Focuses on proven popular combinations

**Disadvantages:**

- ❌ Requires large order history (100+ orders)
- ❌ May find very few patterns
- ❌ Fewer recommendations
- ❌ May fall back to "Popular Choices" more often

---

## 📈 How Many Orders Are Needed?

### Current System Requirements

**Minimum Orders:** 3 delivered orders (hardcoded in code)

**Code Location:** `backend/controllers/recommendationController.js` (line 84)

```javascript
if (orders.length < 3) {
  // Not enough data, return popular items instead
  const popularItems = await getPopularItems();
  return res.json({
    success: true,
    recommendations: popularItems,
    fallback: true,
    message: "Showing popular items (insufficient order history)",
  });
}
```

### Recommended Orders by Support Level

| Support Threshold | Minimum Orders | Recommended Orders | Why?                                 |
| ----------------- | -------------- | ------------------ | ------------------------------------ |
| **3% (0.03)**     | 3 orders       | 10-20 orders       | Need at least 1 order with pattern   |
| **5% (0.05)**     | 5 orders       | 20-50 orders       | Need at least 1 order with pattern   |
| **10% (0.1)**     | 10 orders      | 50-100 orders      | Need at least 1 order with pattern   |
| **30% (0.3)**     | 30 orders      | **100-200 orders** | Need at least 30 orders with pattern |

### Why More Orders Are Better

**Example with 30% Support:**

**Scenario 1: 50 Orders**

- Need 30% support = 15 orders minimum
- If "Chicken Biryani" appears in 10 orders → Support = 20%
- ❌ **Fails** 30% threshold (20% < 30%)
- Result: No patterns found → Falls back to Popular Choices

**Scenario 2: 200 Orders**

- Need 30% support = 60 orders minimum
- If "Chicken Biryani" appears in 70 orders → Support = 35%
- ✅ **Passes** 30% threshold (35% > 30%)
- Result: Patterns found → Recommendations generated

### Practical Recommendations

#### **For 3% Support:**

- **Minimum:** 3 orders (system requirement)
- **Recommended:** 10-20 orders for reliable patterns
- **Optimal:** 50+ orders

#### **For 30% Support (Current Setting):**

- **Minimum:** 3 orders (system requirement, but will likely fallback)
- **Recommended:** **100-200 orders** for reliable patterns
- **Optimal:** 300+ orders

**Why?**

- With 30% support, you need items that appear in at least 30% of orders
- If you have 50 orders, you need items in at least 15 orders
- If you have 100 orders, you need items in at least 30 orders
- With fewer orders, very few items will meet the 30% threshold

---

## 🔄 What Happens with Different Order Counts?

### Scenario 1: 10 Orders (30% Support)

**Calculation:**

- Need 30% support = 3 orders minimum
- Most items appear in 1-2 orders
- Very few items appear in 3+ orders

**Result:**

- ❌ Very few frequent itemsets found
- ❌ Very few association rules generated
- ✅ System falls back to "Popular Choices"

### Scenario 2: 50 Orders (30% Support)

**Calculation:**

- Need 30% support = 15 orders minimum
- Popular items might appear in 10-20 orders
- Some items may meet threshold

**Result:**

- ⚠️ Some patterns found (if popular items exist)
- ⚠️ Limited recommendations
- ⚠️ May still fall back to "Popular Choices" often

### Scenario 3: 100 Orders (30% Support)

**Calculation:**

- Need 30% support = 30 orders minimum
- Popular items likely appear in 30+ orders
- Multiple items meet threshold

**Result:**

- ✅ Good patterns found
- ✅ Reliable recommendations
- ✅ Less reliance on "Popular Choices"

### Scenario 4: 200+ Orders (30% Support)

**Calculation:**

- Need 30% support = 60+ orders minimum
- Many popular items appear in 60+ orders
- Strong patterns emerge

**Result:**

- ✅ Excellent patterns found
- ✅ High-quality recommendations
- ✅ Rarely falls back to "Popular Choices"

---

## 💡 Recommendations for Your System

### Current Setting: 30% Support, 60% Confidence

**This is a STRICT setting suitable for:**

- ✅ Large order history (100+ orders)
- ✅ Established restaurant with many customers
- ✅ High-quality, reliable recommendations

**If you have fewer orders, consider:**

1. **Lower Support to 10-15%** if you have 50-100 orders
2. **Lower Support to 5%** if you have 20-50 orders
3. **Lower Support to 3%** if you have 10-20 orders

### Suggested Configuration by Order Count

| Order Count | Recommended Support | Recommended Confidence | Notes              |
| ----------- | ------------------- | ---------------------- | ------------------ |
| **3-10**    | 3% (0.03)           | 30% (0.3)              | Very new system    |
| **10-30**   | 5% (0.05)           | 40% (0.4)              | Growing system     |
| **30-50**   | 10% (0.1)           | 50% (0.5)              | Established system |
| **50-100**  | 15% (0.15)          | 55% (0.55)             | Well-established   |
| **100-200** | 20% (0.2)           | 60% (0.6)              | Large system       |
| **200+**    | 30% (0.3)           | 60% (0.6)              | Very large system  |

---

## 📊 Summary

### Key Differences: 3% vs 30% Support

| Aspect                 | 3% Support                    | 30% Support                   |
| ---------------------- | ----------------------------- | ----------------------------- |
| **Strictness**         | Lenient                       | Very Strict                   |
| **Patterns Found**     | Many (common + rare)          | Few (only very common)        |
| **Minimum Orders**     | 3 orders                      | 30 orders (for 1 item)        |
| **Recommended Orders** | 10-20 orders                  | 100-200 orders                |
| **Quality**            | Lower (may include noise)     | Higher (only strong patterns) |
| **Recommendations**    | More (some may be irrelevant) | Fewer (but more relevant)     |
| **Use Case**           | New/small system              | Large/established system      |

### Minimum Orders for Recommendations

**System Requirement:** 3 delivered orders (hardcoded)

**Practical Requirements:**

- **3% Support:** 10-20 orders recommended
- **30% Support:** **100-200 orders recommended**

**Why?**

- With 30% support, you need items appearing in at least 30% of orders
- With 50 orders, you need items in 15+ orders
- With 100 orders, you need items in 30+ orders
- With fewer orders, very few items meet the threshold → falls back to Popular Choices

---

**Last Updated:** Based on current codebase with 30% support and 60% confidence
