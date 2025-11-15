import Order from '../models/ordermodel.js';
import Item from '../models/itemModel.js';
import AprioriAlgorithm from '../utils/aprioriAlgorithm.js';

/**
 * Train the recommendation model using historical orders
 */
export const trainRecommendationModel = async (req, res) => {
  try {
    // Fetch all completed orders
    const orders = await Order.find({ status: 'delivered' });

    if (orders.length === 0) {
      return res.json({
        success: false,
        message: 'No order history available for training'
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
      message: 'Model trained successfully',
      stats: {
        totalOrders: orders.length,
        frequentItemsets: frequentItemsets.length,
        rules: rules.length
      }
    });
  } catch (error) {
    console.error('Error training recommendation model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to train recommendation model',
      error: error.message
    });
  }
};

/**
 * Get recommendations based on cart items
 */
export const getRecommendations = async (req, res) => {
  try {
    const { cartItems } = req.body; // Array of item IDs in cart
    console.log('\n=== GET RECOMMENDATIONS REQUEST ===');
    console.log('Cart items received:', cartItems);

    if (!cartItems || cartItems.length === 0) {
      console.log('No cart items provided');
      return res.json({
        success: true,
        recommendations: []
      });
    }

    // Fetch all completed orders for analysis
    const orders = await Order.find({ status: 'delivered' });
    console.log(`Found ${orders.length} delivered orders`);

    if (orders.length < 3) {
      // Not enough data, return popular items instead
      console.log('⚠️ Insufficient order history (need at least 3 delivered orders)');
      const popularItems = await getPopularItems();
      console.log(`Returning ${popularItems.length} popular items as fallback`);
      return res.json({
        success: true,
        recommendations: popularItems.filter(item => 
          !cartItems.includes(item._id.toString())
        ).slice(0, 5),
        fallback: true,
        message: 'Showing popular items (insufficient order history)'
      });
    }

    // Convert orders to transactions
    // Note: order.items contains embedded objects with item.name, not references
    // We need to match by item name to find the actual item IDs
    const transactions = [];
    
    for (const order of orders) {
      const itemNames = order.items.map(item => item.item.name);
      console.log(`Order ${order._id}: items = [${itemNames.join(', ')}]`);
      
      // Find item IDs by matching names
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
    
    console.log('Transactions for Apriori:', JSON.stringify(transactions, null, 2));

    // Initialize and run Apriori
    console.log('Running Apriori algorithm...');
    const apriori = new AprioriAlgorithm(0.05, 0.6);
    const { rules } = apriori.run(transactions);
    console.log(`Generated ${rules.length} association rules`);

    // Get recommendations based on cart
    console.log('Getting recommendations for cart items...');
    const recommendations = apriori.getRecommendations(cartItems, rules, 5);
    console.log(`Apriori returned ${recommendations.length} recommendations`);

    if (recommendations.length === 0) {
      // No rules found, return popular items
      console.log('⚠️ No matching rules found, falling back to popular items');
      const popularItems = await getPopularItems();
      console.log(`Returning ${popularItems.length} popular items`);
      return res.json({
        success: true,
        recommendations: popularItems.filter(item => 
          !cartItems.includes(item._id.toString())
        ).slice(0, 5),
        fallback: true,
        message: 'Showing popular items'
      });
    }
    
    console.log('Recommendations from Apriori:', recommendations.map(r => ({ itemId: r.itemId, score: r.score })));

    // Fetch full item details for recommendations
    const itemIds = recommendations.map(rec => rec.itemId);
    const items = await Item.find({ _id: { $in: itemIds } });

    // Combine item details with recommendation scores
    const enrichedRecommendations = recommendations.map(rec => {
      const item = items.find(i => i._id.toString() === rec.itemId);
      return {
        ...item.toObject(),
        recommendationScore: rec.score,
        basedOn: rec.basedOn
      };
    });

    console.log(` Sending ${enrichedRecommendations.length} Apriori-based recommendations`);
    enrichedRecommendations.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec.name} (score: ${rec.recommendationScore.toFixed(2)}, based on: ${rec.basedOn.join(', ')})`);
    });

    res.json({
      success: true,
      recommendations: enrichedRecommendations,
      fallback: false
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
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
    console.error('Error fetching popular items:', error);
    return [];
  }
};

/**
 * Get recommendation stats
 */
export const getRecommendationStats = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'delivered' });
    
    if (orders.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalOrders: 0,
          message: 'No order history available'
        }
      });
    }

    const transactions = orders.map(order => 
      order.items.map(item => item.item.toString())
    );

    const apriori = new AprioriAlgorithm(0.05, 0.6);
    const { frequentItemsets, rules } = apriori.run(transactions);

    // Get most frequent item combinations
    const topCombinations = frequentItemsets
      .filter(item => item.itemset.length >= 2)
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
        topRules: topRules
      }
    });
  } catch (error) {
    console.error('Error getting recommendation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendation stats',
      error: error.message
    });
  }
};

