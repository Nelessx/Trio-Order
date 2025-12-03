import Order from "../models/ordermodel.js";
import Item from "../models/itemModel.js";
import AprioriAlgorithm from "../utils/aprioriAlgorithm.js";

/**
 * Train the recommendation model using historical orders
 */
export const trainRecommendationModel = async (req, res) => {
  try {
    // Fetch all completed orders
    const orders = await Order.find({ status: "delivered" });

    if (orders.length === 0) {
      return res.json({
        success: false,
        message: "No order history available for training",
      });
    }

    // Convert orders to transactions (array of item IDs)
    const transactions = [];

    for (const order of orders) {
      const itemIds = [];
      for (const orderItem of order.items) {
        const foundItem = await Item.findOne({ name: orderItem.item.name });
        if (foundItem) {
          itemIds.push(foundItem._id.toString());
        }
      }
      if (itemIds.length > 0) {
        transactions.push(itemIds);
      }
    }

    // Initialize Apriori with configurable parameters
    const minSupport = 0.05; // 5% minimum support
    const minConfidence = 0.6; // 60% minimum confidence
    const apriori = new AprioriAlgorithm(minSupport, minConfidence);

    // Run Apriori algorithm
    const { frequentItemsets, rules } = apriori.run(transactions);

    res.json({
      success: true,
      message: "Model trained successfully",
      stats: {
        totalOrders: orders.length,
        frequentItemsets: frequentItemsets.length,
        rules: rules.length,
      },
    });
  } catch (error) {
    console.error("Error training recommendation model:", error);
    res.status(500).json({
      success: false,
      message: "Failed to train recommendation model",
      error: error.message,
    });
  }
};

/**
 * Get recommendations based on cart items
 */
export const getRecommendations = async (req, res) => {
  try {
    const { cartItems } = req.body;

    console.log("Cart items:", cartItems);

    // Get all delivered orders
    const orders = await Order.find({ status: "delivered" });

    if (orders.length < 3) {
      const popularItems = await Item.find({})
        .sort({ hearts: -1, rating: -1 })
        .limit(10);
      return res.json({
        success: true,
        recommendations: popularItems,
        fallback: true,
        message: "Showing popular items (insufficient order history)",
      });
    }

    // Convert orders to transactions (array of item IDs)
    const transactions = [];
    for (const order of orders) {
      const itemIds = [];
      for (const orderItem of order.items) {
        const foundItem = await Item.findOne({ name: orderItem.item.name });
        if (foundItem) {
          itemIds.push(foundItem._id.toString());
        }
      }
      if (itemIds.length > 0) {
        transactions.push(itemIds);
      }
    }

    console.log(`Total transactions: ${transactions.length}`);

    // Run Apriori algorithm
    const apriori = new AprioriAlgorithm(0.05, 0.6);
    const { rules, frequentItemsets } = apriori.run(transactions);

    console.log(`Total rules generated: ${rules.length}`);

    // Get recommendations based on cart items
    let recommendations = apriori.getRecommendations(cartItems, rules, 5);

    console.log(`Recommendations before filtering: ${recommendations.length}`);

    if (recommendations.length === 0) {
      const popularItems = await Item.find({})
        .sort({ hearts: -1, rating: -1 })
        .limit(10);
      return res.json({
        success: true,
        recommendations: popularItems,
        fallback: true,
      });
    }

    // ===== FETCH FULL ITEM DATA & CALCULATE REAL METRICS =====
    const itemIds = recommendations.map((rec) => rec.itemId);
    const items = await Item.find({ _id: { $in: itemIds } });

    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const item = items.find((i) => i._id.toString() === rec.itemId);

        if (!item) return null;

        // ===== CALCULATE REAL METRICS =====

        // 1. GET CONFIDENCE (How often people who buy cartItems also buy this item)
        let confidence = rec.score || 0;

        // Find the actual rule that generated this recommendation
        const matchingRule = rules.find(
          (rule) =>
            rule.consequent.includes(rec.itemId) &&
            rule.antecedent.some((ant) => cartItems.includes(ant))
        );

        if (matchingRule) {
          confidence = matchingRule.confidence || matchingRule.score || 0;
        }

        // 2. GET SUPPORT (How often this item pair appears in all orders)
        let support = rec.support || 0;

        // Calculate support: (orders with both item AND cartItem) / total orders
        if (rec.basedOn && rec.basedOn.length > 0) {
          let pairCount = 0;
          for (const transaction of transactions) {
            const hasRecommendedItem = transaction.includes(rec.itemId);
            const hasCartItem = rec.basedOn.some((cartItemId) =>
              transaction.includes(cartItemId)
            );
            if (hasRecommendedItem && hasCartItem) {
              pairCount++;
            }
          }
          support = pairCount / transactions.length;
        }

        // 3. GET ITEM NAMES FROM IDs (for "Based on" field)
        let baseOnNames = [];
        if (rec.basedOn && rec.basedOn.length > 0) {
          const baseItems = await Item.find({ _id: { $in: rec.basedOn } });
          baseOnNames = baseItems.map((bi) => bi.name);
        }

        console.log(
          `Item: ${item.name}, Confidence: ${(confidence * 100).toFixed(
            2
          )}%, Support: ${(support * 100).toFixed(
            2
          )}%, BasedOn: ${baseOnNames.join(", ")}`
        );

        return {
          ...item.toObject(),

          // ✨ REAL RECOMMENDATION METRICS ✨
          recommendationScore: confidence, // Real confidence (0-1)
          confidence: confidence, // Same as above
          support: support, // Real support (0-1)
          basedOn: baseOnNames, // Item names instead of IDs

          // For display purposes
          confidence_percent: Math.round(confidence * 100),
          support_percent: Math.round(support * 100),

          // Debug info
          __debug: {
            score: rec.score,
            support: rec.support,
            basedOnIds: rec.basedOn,
            basedOnNames: baseOnNames,
            matchingRule: matchingRule
              ? {
                  antecedent: matchingRule.antecedent,
                  consequent: matchingRule.consequent,
                  confidence: matchingRule.confidence,
                  support: matchingRule.support,
                }
              : null,
          },
        };
      })
    );

    // Remove null entries
    const finalRecommendations = enrichedRecommendations.filter(
      (r) => r !== null
    );

    console.log("Final enriched recommendations:", finalRecommendations);

    res.json({
      success: true,
      recommendations: finalRecommendations,
      fallback: false,
      debug: {
        totalOrders: orders.length,
        totalTransactions: transactions.length,
        rulesGenerated: rules.length,
        recommendationsReturned: finalRecommendations.length,
      },
    });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Get popular items as fallback
 */
const getPopularItems = async () => {
  try {
    // Get items sorted by popularity (hearts) and rating
    const items = await Item.find({})
      .sort({ hearts: -1, rating: -1 })
      .limit(10);
    return items;
  } catch (error) {
    console.error("Error fetching popular items:", error);
    return [];
  }
};

/**
 * Get recommendation stats
 */
export const getRecommendationStats = async (req, res) => {
  try {
    const orders = await Order.find({ status: "delivered" });

    if (orders.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalOrders: 0,
          message: "No order history available",
        },
      });
    }

    const transactions = orders.map((order) =>
      order.items.map((item) => item.item.toString())
    );

    const apriori = new AprioriAlgorithm(0.05, 0.6);
    const { frequentItemsets, rules } = apriori.run(transactions);

    // Get most frequent item combinations
    const topCombinations = frequentItemsets
      .filter((item) => item.itemset.length >= 2)
      .sort((a, b) => b.support - a.support)
      .slice(0, 10);

    // Get strongest rules
    const topRules = rules.slice(0, 10);

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        totalTransactions: transactions.length,
        frequentItemsetsCount: frequentItemsets.length,
        rulesCount: rules.length,
        topCombinations: topCombinations,
        topRules: topRules,
      },
    });
  } catch (error) {
    console.error("Error getting recommendation stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendation stats",
      error: error.message,
    });
  }
};
