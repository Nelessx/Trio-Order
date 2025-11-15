# Apriori Algorithm & Popular Choices - Complete Explanation

## 📋 Table of Contents

1. [How Apriori Algorithm Works](#how-apriori-algorithm-works)
2. [How Popular Choices Are Configured](#how-popular-choices-are-configured)
3. [What Happens When No Recommendations Exist](#what-happens-when-no-recommendations-exist)

---

## 🔍 How Apriori Algorithm Works

### Overview

The Apriori algorithm analyzes historical order data to find patterns (which items are frequently ordered together) and generates recommendations based on those patterns.

### Step-by-Step Process

#### **Step 1: Data Collection**

- System fetches all **delivered orders** **directly from the database** using MongoDB query
- **NOT through admin interface** - it's a direct database query
- Uses: `Order.find({ status: 'delivered' })` - gets ALL delivered orders regardless of deletion flags
- Each order is converted into a **transaction** (array of item IDs)

**Important Note:**

- The algorithm queries **directly from the database**, not through admin routes
- It gets **ALL delivered orders** (including those deleted by admin or customer)
- This ensures maximum data for pattern analysis

**Example:**

```javascript
// Historical orders become transactions:
Transaction 1: ["item1", "item2", "item3"]  // Order 1
Transaction 2: ["item2", "item4"]           // Order 2
Transaction 3: ["item1", "item2", "item5"]  // Order 3
```

#### **Step 2: Find Frequent Itemsets**

The algorithm finds itemsets (groups of items) that appear together frequently:

1. **Count individual items** (1-itemsets):

   - Count how many times each item appears
   - Calculate **Support** = (Item Count) / (Total Transactions)
   - Keep only items with Support ≥ 5% (minSupport = 0.05)

2. **Generate 2-itemsets**:

   - Combine frequent 1-itemsets into pairs
   - Count how many transactions contain both items
   - Keep pairs with Support ≥ 5%

3. **Generate k-itemsets** (3, 4, 5...):
   - Continue combining itemsets
   - Use **Apriori Principle**: "If an itemset is infrequent, all its supersets are infrequent"
   - This prunes unnecessary combinations (saves computation)

**Example:**

```
If ["Chicken Biryani"] appears in 60% of orders → Frequent ✓
If ["Raita"] appears in 50% of orders → Frequent ✓
If ["Chicken Biryani", "Raita"] appears in 40% of orders → Frequent ✓
```

#### **Step 3: Generate Association Rules**

For each frequent itemset with 2+ items, create rules:

**Rule Format:** `Antecedent → Consequent`

- **Antecedent**: Items already in cart (IF part)
- **Consequent**: Items to recommend (THEN part)

**Example:**

```
Rule: ["Chicken Biryani"] → ["Raita"]
Confidence = Support(["Chicken Biryani", "Raita"]) / Support(["Chicken Biryani"])
Confidence = 0.4 / 0.6 = 0.67 (67%)
```

**Filtering:**

- Only keep rules with **Confidence ≥ 60%** (minConfidence = 0.6)
- Sort by confidence (highest first)

#### **Step 4: Generate Recommendations**

When user adds items to cart:

1. **Extract cart items** (item IDs)
2. **Find matching rules** where antecedent items match cart items
3. **Collect consequent items** as recommendations
4. **Filter out items** already in cart
5. **Sort by confidence score** (highest first)
6. **Return top 5 recommendations**

**Example:**

```
Cart: ["Chicken Biryani"]
↓
Matching Rule: ["Chicken Biryani"] → ["Raita"] (67% confidence)
↓
Recommendation: "Raita" (score: 0.67)
```

### Algorithm Parameters

| Parameter       | Value     | Meaning                                   |
| --------------- | --------- | ----------------------------------------- |
| `minSupport`    | 0.05 (5%) | Item must appear in at least 5% of orders |
| `minConfidence` | 0.6 (60%) | Rule must have at least 60% confidence    |

**Location:** `backend/utils/aprioriAlgorithm.js`

### Data Source: Direct Database Access

**How Orders Are Fetched:**

```javascript
// Direct database query - NOT through admin interface
const orders = await Order.find({ status: "delivered" });
```

**Key Points:**

1. **Direct Database Access**: Uses Mongoose `Order.find()` - direct MongoDB query
2. **No Admin Interface**: Doesn't go through admin routes or admin authentication
3. **All Delivered Orders**: Gets ALL orders with status 'delivered', regardless of:
   - `deletedByAdmin` flag
   - `deletedByCustomer` flag
   - User ownership
4. **Real-time Data**: Always uses current database state

**Code Location:** `backend/controllers/recommendationController.js` (line 81)

**Why This Matters:**

- Ensures maximum data for pattern analysis
- Includes all historical orders, even if deleted from admin/customer views
- Provides more accurate recommendations based on complete order history

**Comparison:**

| Method      | Admin Orders View         | User Orders View             | Apriori Algorithm    |
| ----------- | ------------------------- | ---------------------------- | -------------------- |
| **Source**  | Admin routes              | User routes                  | Direct database      |
| **Filter**  | Excludes `deletedByAdmin` | Excludes `deletedByCustomer` | No deletion filter   |
| **Access**  | Through admin API         | Through user API             | Direct MongoDB query |
| **Purpose** | Admin management          | User history                 | Pattern analysis     |

---

## ⭐ How Popular Choices Are Configured

### When Popular Choices Are Used

Popular choices are used as a **fallback** when:

1. **Insufficient order history** (< 3 delivered orders)
2. **No matching rules found** (Apriori returns 0 recommendations)

### How Popular Choices Are Selected

**Location:** `backend/controllers/recommendationController.js` (line 189-200)

```javascript
const getPopularItems = async () => {
  // Get items sorted by:
  // 1. hearts (descending) - Most liked items first
  // 2. rating (descending) - Highest rated items first
  const items = await Item.find({}).sort({ hearts: -1, rating: -1 }).limit(10);
  return items;
};
```

### Selection Criteria

1. **Primary Sort: `hearts` (descending)**

   - Items with most "hearts" (likes) appear first
   - Example: Item with 285 hearts > Item with 155 hearts

2. **Secondary Sort: `rating` (descending)**

   - If two items have same hearts, higher rating wins
   - Example: 5.0 rating > 4.5 rating

3. **Limit: Top 10 items**
   - System fetches top 10 popular items
   - Then filters out items already in cart
   - Returns top 5 items

### Example

```javascript
// Database items:
Item A: hearts=285, rating=4.8  → Rank 1
Item B: hearts=155, rating=5.0  → Rank 2
Item C: hearts=155, rating=4.5  → Rank 3
Item D: hearts=85,  rating=4.2   → Rank 4
```

**Result:** Items A, B, C, D are selected (if not in cart)

---

## 🚫 What Happens When No Recommendations Exist

### Scenario 1: Insufficient Order History

**Condition:** Less than 3 delivered orders in database

**Code Location:** `backend/controllers/recommendationController.js` (line 84-96)

```javascript
if (orders.length < 3) {
  // Not enough data, return popular items instead
  const popularItems = await getPopularItems();
  return res.json({
    success: true,
    recommendations: popularItems
      .filter((item) => !cartItems.includes(item._id.toString()))
      .slice(0, 5),
    fallback: true,
    message: "Showing popular items (insufficient order history)",
  });
}
```

**What Happens:**

- ✅ System detects insufficient data
- ✅ Automatically switches to popular items
- ✅ Returns top 5 popular items (not in cart)
- ✅ Sets `fallback: true` flag

**Frontend Display:**

- Title changes to: **"Popular Choices"**
- Subtitle: **"Customers favorite picks"**
- Shows items sorted by hearts and rating

---

### Scenario 2: No Matching Rules Found

**Condition:** Apriori algorithm runs but finds 0 matching rules

**Code Location:** `backend/controllers/recommendationController.js` (line 135-147)

```javascript
if (recommendations.length === 0) {
  // No rules found, return popular items
  const popularItems = await getPopularItems();
  return res.json({
    success: true,
    recommendations: popularItems
      .filter((item) => !cartItems.includes(item._id.toString()))
      .slice(0, 5),
    fallback: true,
    message: "Showing popular items",
  });
}
```

**What Happens:**

- ✅ Apriori runs successfully
- ✅ But no rules match user's cart items
- ✅ System automatically falls back to popular items
- ✅ Returns top 5 popular items (not in cart)
- ✅ Sets `fallback: true` flag

**Why This Happens:**

- Cart items are new/rare combinations
- No historical orders contain similar items
- Items in cart don't have strong associations

---

### Scenario 3: Empty Cart

**Condition:** User has no items in cart

**Code Location:** `backend/controllers/recommendationController.js` (line 72-77)

```javascript
if (!cartItems || cartItems.length === 0) {
  return res.json({
    success: true,
    recommendations: [],
  });
}
```

**What Happens:**

- ✅ System returns empty recommendations array
- ✅ Frontend doesn't show recommendations section
- ✅ No error, just no recommendations to show

**Frontend Behavior:**

- Component checks: `if (recommendations.length === 0) return null;`
- Recommendations section is hidden

---

### Scenario 4: All Popular Items Already in Cart

**Condition:** User already has all top popular items in cart

**What Happens:**

- ✅ System filters out items in cart
- ✅ If all top 10 popular items are in cart → returns empty array
- ✅ Frontend hides recommendations section

---

## 📊 Flow Diagram

```
User Adds Items to Cart
         ↓
System Checks Order History
         ↓
    ┌────┴────┐
    │         │
< 3 orders  ≥ 3 orders
    │         │
    ↓         ↓
Popular    Run Apriori
Items      Algorithm
    │         │
    │         ↓
    │    Find Matching Rules
    │         │
    │    ┌────┴────┐
    │    │         │
    │  0 rules   > 0 rules
    │    │         │
    │    ↓         ↓
    │ Popular   Return
    │ Items     Recommendations
    │    │         │
    └────┴─────────┘
         ↓
  Filter Out Cart Items
         ↓
  Return Top 5 Items
         ↓
  Display in Frontend
```

---

## 🎯 Summary

### Apriori Algorithm

- **Purpose:** Find patterns in historical orders
- **Input:** All delivered orders
- **Output:** Association rules (IF cart has X, THEN recommend Y)
- **Parameters:** minSupport=5%, minConfidence=60%

### Popular Choices

- **Purpose:** Fallback when Apriori can't provide recommendations
- **Selection:** Sort by hearts (descending), then rating (descending)
- **Limit:** Top 5 items (excluding cart items)

### Fallback Scenarios

1. **< 3 orders** → Popular items
2. **0 matching rules** → Popular items
3. **Empty cart** → No recommendations shown
4. **All popular items in cart** → No recommendations shown

### Frontend Display

- **Apriori recommendations:** "You Might Also Like" + "Based on your cart items"
- **Popular choices:** "Popular Choices" + "Customers favorite picks"
- **No recommendations:** Section hidden

---

## 📁 File Locations

| Component                 | File Path                                                     |
| ------------------------- | ------------------------------------------------------------- |
| Apriori Algorithm         | `backend/utils/aprioriAlgorithm.js`                           |
| Recommendation Controller | `backend/controllers/recommendationController.js`             |
| Frontend Component        | `frontend/src/components/Recommendations/Recommendations.jsx` |
| Documentation             | `APRIORI_ALGORITHM_DOCUMENTATION.md`                          |

---

## 🔧 Configuration

To modify the behavior, edit these values in `recommendationController.js`:

```javascript
// Minimum orders required (line 84)
if (orders.length < 3) { ... }  // Change 3 to desired number

// Apriori parameters (line 126)
const apriori = new AprioriAlgorithm(0.05, 0.6);
// minSupport=0.05 (5%), minConfidence=0.6 (60%)

// Number of recommendations (line 132)
const recommendations = apriori.getRecommendations(cartItems, rules, 5);
// Change 5 to desired number

// Popular items limit (line 194)
.limit(10);  // Change 10 to desired number
```

---

**Last Updated:** Based on current codebase implementation
