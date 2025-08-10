def calculate_budget_allocation(platform_results):
    """
    Calculate optimal budget allocation based on platform performance metrics.
    
    Args:
        platform_results (dict): Dictionary with platform names as keys and analysis results as values
                                Format: {'Google': {...}, 'Meta': {...}, 'TikTok': {...}, 'LinkedIn': {...}}
    
    Returns:
        dict: Budget allocation percentages for each platform
    """
    
    platform_scores = {}
    
    for platform, results in platform_results.items():
        # Extract key metrics
        cpm_p50 = results['CPM']['p50']  # Median cost per mille
        ctr_p50 = results['CTR']['p50']  # Median click-through rate
        cvr_p50 = results['CVR']['p50']  # Median conversion rate
        
        # Extract certainty scores (higher is better)
        cpm_certainty = results['CPM']['certainty_pct']
        ctr_certainty = results['CTR']['certainty_pct']
        cvr_certainty = results['CVR']['certainty_pct']
        
        # Calculate efficiency metrics
        # Cost per click = CPM / (CTR * 1000)
        cost_per_click = cpm_p50 / (ctr_p50 * 1000)
        
        # Cost per conversion = Cost per click / CVR
        cost_per_conversion = cost_per_click / cvr_p50
        
        # Overall conversion rate from impression to conversion
        overall_conversion_rate = ctr_p50 * cvr_p50
        
        # Calculate composite score (higher is better)
        # We want: high conversion rate, low cost per conversion, high certainty
        efficiency_score = overall_conversion_rate / cost_per_conversion
        
        # Average certainty across all metrics
        avg_certainty = (cpm_certainty + ctr_certainty + cvr_certainty) / 3
        
        # Combine efficiency and certainty (weighted)
        # 70% efficiency, 30% certainty
        composite_score = (0.7 * efficiency_score * 1000000) + (0.3 * avg_certainty)
        
        platform_scores[platform] = {
            'composite_score': composite_score,
            'cost_per_conversion': cost_per_conversion,
            'overall_conversion_rate': overall_conversion_rate,
            'avg_certainty': avg_certainty
        }
    
    # Calculate total score
    total_score = sum(scores['composite_score'] for scores in platform_scores.values())
    
    # Calculate allocation percentages
    allocations = {}
    for platform, scores in platform_scores.items():
        allocation_pct = (scores['composite_score'] / total_score) * 100
        allocations[platform] = round(allocation_pct, 1)
    
    return {
        'allocations': allocations,
        'details': platform_scores
    }


def format_allocation_output(allocation_result):
    """
    Format the allocation result into a readable string.
    
    Args:
        allocation_result (dict): Result from calculate_budget_allocation
    
    Returns:
        str: Formatted allocation string
    """
    allocations = allocation_result['allocations']
    
    # Sort by allocation percentage (highest first)
    sorted_allocations = sorted(allocations.items(), key=lambda x: x[1], reverse=True)
    
    # Format output
    output_parts = []
    for platform, percentage in sorted_allocations:
        output_parts.append(f"{platform}: {percentage}%")
    
    return " ".join(output_parts)


# Example usage with your data
if __name__ == "__main__":
    # Your platform results
    platform_data = {
        'Google': {
            'CPM': {'certainty_pct': 45.5, 'p10': 5.664778196438264, 'p50': 7.748258114294895, 'p90': 10.626222794664285, 'stability_pct': 0.0},
            'CTR': {'certainty_pct': 24.7, 'p10': 0.009844314766653995, 'p50': 0.017798830325474795, 'p90': 0.032348327546177495, 'stability_pct': 0.0},
            'CVR': {'certainty_pct': 31.240000000000002, 'p10': 0.024587983039335726, 'p50': 0.039662794836444526, 'p90': 0.06417009887270245, 'stability_pct': 0.0}
        },
        'Meta': {
            'CPM': {'certainty_pct': 45.5, 'p10': 5.664778196438264, 'p50': 7.748258114294895, 'p90': 10.626222794664285, 'stability_pct': 0.0},
            'CTR': {'certainty_pct': 24.7, 'p10': 0.009844314766653995, 'p50': 0.017798830325474795, 'p90': 0.032348327546177495, 'stability_pct': 0.0},
            'CVR': {'certainty_pct': 31.240000000000002, 'p10': 0.024587983039335726, 'p50': 0.039662794836444526, 'p90': 0.06417009887270245, 'stability_pct': 0.0}
        },
        'TikTok': {
            'CPM': {'certainty_pct': 45.5, 'p10': 5.664778196438264, 'p50': 7.748258114294895, 'p90': 10.626222794664285, 'stability_pct': 0.0},
            'CTR': {'certainty_pct': 24.7, 'p10': 0.009844314766653995, 'p50': 0.017798830325474795, 'p90': 0.032348327546177495, 'stability_pct': 0.0},
            'CVR': {'certainty_pct': 31.240000000000002, 'p10': 0.024587983039335726, 'p50': 0.039662794836444526, 'p90': 0.06417009887270245, 'stability_pct': 0.0}
        },
        'LinkedIn': {
            'CPM': {'certainty_pct': 45.5, 'p10': 5.664778196438264, 'p50': 7.748258114294895, 'p90': 10.626222794664285, 'stability_pct': 0.0},
            'CTR': {'certainty_pct': 24.7, 'p10': 0.009844314766653995, 'p50': 0.017798830325474795, 'p90': 0.032348327546177495, 'stability_pct': 0.0},
            'CVR': {'certainty_pct': 31.240000000000002, 'p10': 0.024587983039335726, 'p50': 0.039662794836444526, 'p90': 0.06417009887270245, 'stability_pct': 0.0}
        }
    }
    
    # Calculate allocation
    result = calculate_budget_allocation(platform_data)
    
    # Print results
    print("Budget Allocation:")
    print(format_allocation_output(result))
    
    print("\nDetailed Analysis:")
    for platform, details in result['details'].items():
        print(f"{platform}:")
        print(f"  - Cost per Conversion: ${details['cost_per_conversion']:.2f}")
        print(f"  - Overall Conversion Rate: {details['overall_conversion_rate']*100:.3f}%")
        print(f"  - Average Certainty: {details['avg_certainty']:.1f}%")
        print(f"  - Composite Score: {details['composite_score']:.2f}")