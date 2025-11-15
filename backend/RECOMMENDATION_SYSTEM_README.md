# Food Recommendation System using Apriori Algorithm

## Overview

This recommendation system uses the **Apriori Algorithm** to analyze historical order data and provide intelligent product recommendations to customers based on their cart items. The system is built **without any external machine learning libraries**, implementing the Apriori algorithm from scratch.

## How It Works

### 1. Apriori Algorithm Basics

The Apriori algorithm finds frequent itemsets in transaction data and generates association rules.

**Key Concepts:**

- **Support**: How frequently an itemset appears in transactions
- **Confidence**: Likelihood that item B is purchased when item A is purchased
- **Lift**: Strength of association between items

**Formula:**

- Support(A) = (Transactions containing A) / (Total Transactions)
- Confidence(A → B) = Support(A ∪ B) / Support(A)
- Lift(A → B) = Support(A ∪ B) / (Support(A) × Support(B))

### 2. Data Flow

```
Historical Orders → Transactions → Apriori Algorithm → Association Rules → Recommendations
```

**Example:**

```javascript
// Historical orders converted to transactions
[
  ["ChickenBiryani", "Raita", "Lassi"],
  ["PaneerTikka", "NaanBread", "Lassi"],
  ["ChickenBiryani", "Raita", "PaneerTikka"],
];

// Algorithm finds patterns like:
// Rule: [ChickenBiryani] → [Raita] (Confidence: 100%)
// Rule: [PaneerTikka] → [Lassi] (Confidence: 67%)
```

### 3. Recommendation Logic

When a customer adds items to cart:

1. System extracts current cart items
2. Finds association rules where cart items match the antecedent
3. Suggests consequent items not already in cart
4. Ranks by confidence score

**Example:**

```
Cart: [ChickenBiryani]
↓
Rule Found: [ChickenBiryani] → [Raita] (95% confidence)
↓
Recommendation: Raita (because 95% of customers who bought ChickenBiryani also bought Raita)
```

## Implementation

### Backend Files Created

#### 1. `backend/utils/aprioriAlgorithm.js`

Complete Apriori algorithm implementation:

- `findFrequentItemsets()`: Discovers frequent item combinations
- `generateRules()`: Creates association rules
- `getRecommendations()`: Matches cart items to rules
- No external libraries used

#### 2. `backend/controllers/recommendationController.js`

Three main endpoints:

**a) POST `/api/recommendations/get`**

- Input: `{ cartItems: ["itemId1", "itemId2"] }`
- Output: Recommended items with scores
- Fallback: Shows popular items if insufficient data

**b) POST `/api/recommendations/train`**

- Trains model on historical orders
- Returns statistics about learned patterns

**c) GET `/api/recommendations/stats`**

- Shows recommendation system statistics
- Displays top item combinations and rules

#### 3. `backend/routes/recommendationRoute.js`

API routes for recommendation system

#### 4. `backend/server.js`

Integrated recommendation routes

### Frontend Files Created

#### 1. `frontend/src/components/Recommendations/Recommendations.jsx`

Beautiful recommendation UI:

- Displays 5 recommended items
- Shows item images, prices, ratings
- "Add to Cart" integration
- Premium glassmorphism design
- Animated entrance effects
- Responsive grid layout

#### 2. `frontend/src/components/CartPage.jsx/CartPage.jsx`

Updated to include recommendations:

- Shows recommendations between cart items and checkout
- Perfect placement for upselling
- Seamless integration

## Configuration

### Tunable Parameters

In `recommendationController.js`:

```javascript
const minSupport = 0.05; // 5% minimum support (adjust for stricter/looser rules)
const minConfidence = 0.6; // 60% minimum confidence (adjust recommendation threshold)
```

**What to adjust:**

- **Lower minSupport** (e.g., 0.03): Finds more patterns, but less reliable
- **Higher minSupport** (e.g., 0.1): Finds fewer but stronger patterns
- **Lower minConfidence** (e.g., 0.2): More recommendations, lower quality
- **Higher minConfidence** (e.g., 0.5): Fewer recommendations, higher quality

## API Usage

### Get Recommendations

```javascript
POST http://localhost:4000/api/recommendations/get
Content-Type: application/json

{
  "cartItems": ["65f8a1b2c3d4e5f6a7b8c9d0", "65f8a1b2c3d4e5f6a7b8c9d1"]
}

Response:
{
  "success": true,
  "recommendations": [
    {
      "_id": "...",
      "name": "Raita",
      "price": 50,
      "imageUrl": "...",
      "recommendationScore": 0.95,
      "basedOn": ["65f8a1b2c3d4e5f6a7b8c9d0"]
    }
  ],
  "fallback": false
}
```

### Train Model

```javascript
POST http://localhost:4000/api/recommendations/train

Response:
{
  "success": true,
  "message": "Model trained successfully",
  "stats": {
    "totalOrders": 150,
    "frequentItemsets": 45,
    "rules": 23
  }
}
```

### Get Statistics

```javascript
GET http://localhost:4000/api/recommendations/stats

Response:
{
  "success": true,
  "stats": {
    "totalOrders": 150,
    "totalTransactions": 150,
    "frequentItemsetsCount": 45,
    "rulesCount": 23,
    "topCombinations": [...],
    "topRules": [...]
  }
}
```

## Features

### Intelligent Recommendations

- Based on actual customer purchase patterns
- Learns from order history automatically
- No manual configuration needed

### Fallback Mechanism

- Shows popular items when insufficient data
- Ensures recommendations always available

### Real-time Updates

- Recommendations update as cart changes
- No page refresh needed

### Premium UI

- Beautiful glassmorphism design
- Smooth animations with Framer Motion
- Mobile responsive
- "In Cart" indicator for added items

### Performance

- Efficient algorithm implementation
- Caches results for speed
- Handles large transaction datasets

## Algorithm Complexity

- **Time Complexity**: O(n × k²) where n = transactions, k = items
- **Space Complexity**: O(k²) for storing itemsets
- **Scalability**: Efficient for typical restaurant orders (< 100 unique items)

## Example Scenarios

### Scenario 1: Meal Combos

```
Customer adds: Biryani
System learns: 85% of customers also order Raita
Recommendation: "Raita - Frequently ordered with Biryani"
```

### Scenario 2: Dessert Suggestions

```
Customer adds: Main Course items
System learns: 60% of customers order dessert after main course
Recommendation: "Gulab Jamun, Kulfi, Kheer"
```

### Scenario 3: Beverage Pairing

```
Customer adds: Spicy dishes
System learns: 70% of customers order cooling drinks
Recommendation: "Lassi, Buttermilk, Sweet Lime"
```

## Benefits

### For Customers

- Discover complementary items
- Save time browsing menu
- Get personalized suggestions
- Complete meal planning

### For Business

- Increase average order value
- Improve customer satisfaction
- Data-driven upselling
- Better inventory insights

## Maintenance

### Training Frequency

- Automatically trains on each request (real-time)
- Or manually trigger via `/api/recommendations/train`
- Recommended: Train weekly for optimal performance

### Monitoring

- Check `/api/recommendations/stats` regularly
- Monitor recommendation acceptance rate
- Adjust minSupport/minConfidence based on performance

## Future Enhancements

1. **Time-based Recommendations**: Different recommendations for breakfast/lunch/salad
2. **Seasonal Patterns**: Detect seasonal ordering trends
3. **User Preferences**: Personalized based on individual history
4. **A/B Testing**: Test different confidence thresholds
5. **Recommendation Explanation**: Show "why" items are recommended

## Technical Notes

- Algorithm runs in-memory (no database storage of rules)
- Rules regenerated on each request for freshness
- Consider caching for high-traffic sites
- Minimum 3 completed orders needed for meaningful recommendations
- Falls back to popularity-based recommendations otherwise

## Troubleshooting

**No recommendations showing:**

- Ensure orders exist with status "Delivered"
- Check if orders have multiple items
- Lower minSupport/minConfidence values

**Poor recommendations:**

- Need more order history (minimum 20-30 orders recommended)
- Increase minConfidence for quality
- Check if order data is diverse enough

**Slow performance:**

- Cache frequent itemsets and rules
- Implement background training job
- Consider Redis for rule storage
