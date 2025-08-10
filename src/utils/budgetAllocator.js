import convertPlatformData from './platformDataConverter.js';

/**
 * Calculate optimal budget allocation based on platform performance metrics.
 * Translated from budget_allocation.py
 * 
 * @param {Object} platformResults - Dictionary with platform names as keys and analysis results as values
 * @returns {Object} Budget allocation percentages and details for each platform
 */
function calculateBudgetAllocation(platformResults) {
  const platformScores = {};
  
  for (const [platform, results] of Object.entries(platformResults)) {
    // Extract key metrics
    const cpmP50 = results.CPM.p50;  // Median cost per mille
    const ctrP50 = results.CTR.p50;  // Median click-through rate
    const cvrP50 = results.CVR.p50;  // Median conversion rate
    
    // Extract certainty scores (higher is better)
    const cpmCertainty = results.CPM.certainty_pct;
    const ctrCertainty = results.CTR.certainty_pct;
    const cvrCertainty = results.CVR.certainty_pct;
    
    // Calculate efficiency metrics
    // Cost per click = CPM / (CTR * 1000)
    const costPerClick = cpmP50 / (ctrP50 * 1000);
    
    // Cost per conversion = Cost per click / CVR
    const costPerConversion = costPerClick / cvrP50;
    
    // Overall conversion rate from impression to conversion
    const overallConversionRate = ctrP50 * cvrP50;
    
    // Calculate composite score (higher is better)
    // We want: high conversion rate, low cost per conversion, high certainty
    const efficiencyScore = overallConversionRate / costPerConversion;
    
    // Average certainty across all metrics
    const avgCertainty = (cpmCertainty + ctrCertainty + cvrCertainty) / 3;
    
    // Combine efficiency and certainty (weighted)
    // 70% efficiency, 30% certainty
    const compositeScore = (0.7 * efficiencyScore * 1000000) + (0.3 * avgCertainty);
    
    platformScores[platform] = {
      compositeScore,
      costPerConversion,
      overallConversionRate,
      avgCertainty
    };
  }
  
  // Calculate total score
  const totalScore = Object.values(platformScores).reduce((sum, scores) => sum + scores.compositeScore, 0);
  
  // Calculate allocation percentages
  const allocations = {};
  for (const [platform, scores] of Object.entries(platformScores)) {
    const allocationPct = (scores.compositeScore / totalScore) * 100;
    allocations[platform] = Math.round(allocationPct * 10) / 10; // Round to 1 decimal place
  }
  
  return {
    allocations,
    details: platformScores
  };
}

/**
 * Format the allocation result into a readable string.
 * 
 * @param {Object} allocationResult - Result from calculateBudgetAllocation
 * @returns {string} Formatted allocation string
 */
function formatAllocationOutput(allocationResult) {
  const allocations = allocationResult.allocations;
  
  // Sort by allocation percentage (highest first)
  const sortedAllocations = Object.entries(allocations).sort((a, b) => b[1] - a[1]);
  
  // Format output
  const outputParts = sortedAllocations.map(([platform, percentage]) => `${platform}: ${percentage}%`);
  
  return outputParts.join(' ');
}

/**
 * Get budget allocation data formatted for UserModifiedBudget component
 * 
 * @returns {Array} Array of budget data objects with name, value, and color
 */
function getBudgetAllocationForChart() {
  // Get platform data from converter
  const platformData = convertPlatformData();
  
  // Calculate budget allocation
  const allocationResult = calculateBudgetAllocation(platformData);
  
  // Platform colors mapping
  // Platform colors mapping
  const platformColors = {
    'Google': '#34A853',    // Google green
    'Meta': '#1877F2',      // Facebook blue
    'TikTok': '#FF0050',    // TikTok pink
    'LinkedIn': '#FF9500'   // Orange for better contrast
  };
  
  // Convert to chart format
  const budgetData = Object.entries(allocationResult.allocations).map(([platform, percentage]) => ({
    name: platform,
    value: percentage,
    color: platformColors[platform] || '#666666' // fallback color
  }));
  
  return budgetData;
}

/**
 * Get detailed budget allocation analysis
 * 
 * @returns {Object} Complete allocation result with details
 */
function getDetailedBudgetAllocation() {
  const platformData = convertPlatformData();
  return calculateBudgetAllocation(platformData);
}

export {
  calculateBudgetAllocation,
  formatAllocationOutput,
  getBudgetAllocationForChart,
  getDetailedBudgetAllocation
};

export default getBudgetAllocationForChart;