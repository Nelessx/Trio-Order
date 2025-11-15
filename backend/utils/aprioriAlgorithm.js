/**
 * Apriori Algorithm Implementation 
 * Generates frequent itemsets and association rules from transaction data
 */

class AprioriAlgorithm {
  constructor(minSupport = 0.1, minConfidence = 0.5) {
    this.minSupport = minSupport;
    this.minConfidence = minConfidence;
  }

  /**
   * Generate all itemsets of size k from itemsets of size k-1
   */
  generateCandidates(prevItemsets, k) {
    const candidates = [];
    const len = prevItemsets.length;

    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const itemset1 = prevItemsets[i];
        const itemset2 = prevItemsets[j];

        // Join step: combine itemsets if they differ by only one item
        const union = [...new Set([...itemset1, ...itemset2])];
        if (union.length === k) {
          // Sort to avoid duplicates
          const sortedUnion = union.sort();
          const exists = candidates.some(candidate => 
            JSON.stringify(candidate) === JSON.stringify(sortedUnion)
          );
          if (!exists) {
            candidates.push(sortedUnion);
          }
        }
      }
    }

    return candidates;
  }

  /**
   * Calculate support count for an itemset
   */
  calculateSupport(itemset, transactions) {
    let count = 0;
    for (const transaction of transactions) {
      if (itemset.every(item => transaction.includes(item))) {
        count++;
      }
    }
    return count / transactions.length;
  }

  /**
   * Prune candidates based on minimum support
   */
  pruneCandidates(candidates, transactions, frequentItemsets) {
    for (const candidate of candidates) {
      const support = this.calculateSupport(candidate, transactions);
      if (support >= this.minSupport) {
        frequentItemsets.push({
          itemset: candidate,
          support: support
        });
      }
    }
    return frequentItemsets;
  }

  /**
   * Find all frequent itemsets using Apriori algorithm
   */
  findFrequentItemsets(transactions) {
    if (transactions.length === 0) return [];

    const allFrequentItemsets = [];

    // Generate frequent 1-itemsets
    const itemCounts = {};
    for (const transaction of transactions) {
      for (const item of transaction) {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      }
    }

    let currentItemsets = [];
    for (const [item, count] of Object.entries(itemCounts)) {
      const support = count / transactions.length;
      if (support >= this.minSupport) {
        currentItemsets.push({
          itemset: [item],
          support: support
        });
      }
    }

    allFrequentItemsets.push(...currentItemsets);

    // Generate frequent k-itemsets
    let k = 2;
    while (currentItemsets.length > 0) {
      const prevItemsets = currentItemsets.map(item => item.itemset);
      const candidates = this.generateCandidates(prevItemsets, k);
      
      currentItemsets = [];
      this.pruneCandidates(candidates, transactions, currentItemsets);
      
      if (currentItemsets.length > 0) {
        allFrequentItemsets.push(...currentItemsets);
      }
      
      k++;
    }

    return allFrequentItemsets;
  }

  /**
   * Generate association rules from frequent itemsets
   */
  generateRules(frequentItemsets) {
    const rules = [];

    // Only consider itemsets with 2 or more items
    const multiItemsets = frequentItemsets.filter(item => item.itemset.length >= 2);

    for (const itemsetObj of multiItemsets) {
      const itemset = itemsetObj.itemset;
      const itemsetSupport = itemsetObj.support;

      // Generate all possible subsets as antecedents
      const subsets = this.generateSubsets(itemset);
      
      for (const antecedent of subsets) {
        if (antecedent.length === 0 || antecedent.length === itemset.length) {
          continue;
        }

        const consequent = itemset.filter(item => !antecedent.includes(item));
        
        // Find support of antecedent
        const antecedentSupport = frequentItemsets.find(item => 
          item.itemset.length === antecedent.length &&
          antecedent.every(a => item.itemset.includes(a))
        )?.support || 0;

        if (antecedentSupport > 0) {
          const confidence = itemsetSupport / antecedentSupport;
          
          if (confidence >= this.minConfidence) {
            rules.push({
              antecedent: antecedent,
              consequent: consequent,
              support: itemsetSupport,
              confidence: confidence,
              lift: itemsetSupport / (antecedentSupport * this.calculateConsequentSupport(consequent, frequentItemsets))
            });
          }
        }
      }
    }

    // Sort rules by confidence (descending)
    return rules.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate support for consequent
   */
  calculateConsequentSupport(consequent, frequentItemsets) {
    const found = frequentItemsets.find(item => 
      item.itemset.length === consequent.length &&
      consequent.every(c => item.itemset.includes(c))
    );
    return found ? found.support : 0.01; // Avoid division by zero
  }

  /**
   * Generate all subsets of an array
   */
  generateSubsets(arr) {
    const subsets = [[]];
    
    for (const item of arr) {
      const len = subsets.length;
      for (let i = 0; i < len; i++) {
        subsets.push([...subsets[i], item]);
      }
    }
    
    return subsets;
  }

  /**
   * Get recommendations based on cart items
   */
  getRecommendations(cartItems, rules, limit = 5) {
    const recommendations = new Map();

    // Find rules where antecedent matches cart items
    for (const rule of rules) {
      // Check if all antecedent items are in cart
      const matchingItems = rule.antecedent.filter(item => cartItems.includes(item));
      
      if (matchingItems.length > 0) {
        // Add consequent items as recommendations
        for (const item of rule.consequent) {
          // Don't recommend items already in cart
          if (!cartItems.includes(item)) {
            if (!recommendations.has(item)) {
              recommendations.set(item, {
                itemId: item,
                score: rule.confidence,
                support: rule.support,
                basedOn: rule.antecedent
              });
            } else {
              // If item already recommended, take highest confidence
              const existing = recommendations.get(item);
              if (rule.confidence > existing.score) {
                recommendations.set(item, {
                  itemId: item,
                  score: rule.confidence,
                  support: rule.support,
                  basedOn: rule.antecedent
                });
              }
            }
          }
        }
      }
    }

    // Convert to array and sort by score
    const sortedRecommendations = Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedRecommendations;
  }

  /**
   * Main function to run Apriori algorithm
   */
  run(transactions) {
    const frequentItemsets = this.findFrequentItemsets(transactions);
    const rules = this.generateRules(frequentItemsets);
    return { frequentItemsets, rules };
  }
}

export default AprioriAlgorithm;

