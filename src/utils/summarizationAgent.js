import convertPlatformData from './platformDataConverter.js';
import { getDetailedBudgetAllocation } from './budgetAllocator.js';

// Embedded prompt text (from summarization_prompt.txt)
const SUMMARIZATION_PROMPT = `Analyze the data given. We have the metric rate data for each company:
cpm_mean, cpm_cv, ctr_mean, ctr_std, cvr_mean, cvr_std

We also have the the simulation data for each company:
{'CPM': {'certainty_pct': 45.5,
         'p10': 5.664778196438264,
         'p50': 7.748258114294895,
         'p90': 10.626222794664285,
         'stability_pct': 0.0},
 'CTR': {'certainty_pct': 24.7,
         'p10': 0.009844314766653995,
         'p50': 0.017798830325474795,
         'p90': 0.032348327546177495,
         'stability_pct': 0.0},
 'CVR': {'certainty_pct': 31.240000000000002,
         'p10': 0.024587983039335726,
         'p50': 0.039662794836444526,
         'p90': 0.06417009887270245,
         'stability_pct': 0.0}}

Use both the metric rate data and the simulation data as context to justify the budget.

We also have a projected budget that we calculate on our end. It will give the percentages of the 4 companies:

  "Google": ..,
  "Meta": ..,
  "Tiktok": ..,
  "Linkedin": ..
 
Go in order from highest budget to lowest budget and justify the budget for each company given the context.
Your output should be:

1. "Company1": X%
I gave X% of the budget to Company1. Because of ...... <5 sentences to justify>

2. "Company2": X%
I gave X% of the budget to Company2. Because of ...... <5 sentences to justify>

3. "Company3": X%
I gave X% of the budget to Company3. Because of ...... <5 sentences to justify>

4. "Company4": X%
I gave X% of the budget to Company4. Because of ...... <5 sentences to justify>

Don't write any more output just he rank, company and description. 
Also note when giving this output please make it readable to nontechnical people. 
Make the output more common man and don't use too much technical jargon. 
Don't say Bayesian analysis. Don't use stats terms.
Also try to also expain any terms you use.
...
...
...
`;

class SummarizationAgent {
  constructor() {
    this.geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.apiKeyAvailable = !!this.geminiKey;
  }

  isApiKeyAvailable() {
    return this.apiKeyAvailable;
  }

  // Load platform data from the public data file
  async loadPlatformData() {
    try {
      // Use the correct path - data is in src/data/ not public
      const response = await fetch('./src/data/platformData.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading platform data:', error);
      // Fallback to empty object if file can't be loaded
      return {};
    }
  }

  // Make a single query to Gemini with embedded context
  async getSummary(customContext = '') {
    if (!this.geminiKey) {
      throw new Error('Gemini API key not available');
    }

    // Load raw platform data
    const platformData = await this.loadPlatformData();
    const platformContext = `Raw Platform Data: ${JSON.stringify(platformData, null, 2)}`;
    
    // Get Bayesian calculations from platformDataConverter
    const bayesianResults = convertPlatformData();
    const bayesianContext = `Bayesian Analysis Results: ${JSON.stringify(bayesianResults, null, 2)}`;
    
    // Get budget allocation calculations
    const budgetAllocation = getDetailedBudgetAllocation();
    const budgetContext = `Budget Allocation Analysis: ${JSON.stringify(budgetAllocation, null, 2)}`;
    
    // Build the query with all data sources
    const query = `${platformContext}\n\n${bayesianContext}\n\n${budgetContext}\n\n${customContext}\n\n${SUMMARIZATION_PROMPT}`;

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + this.geminiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: query
            }]
          }]
        })
      });

      const data = await response.json();
      const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from Gemini.';
      
      // Note: Browser version doesn't cache to file system
      // Return only the raw Gemini response text
      return rawOutput;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  // Parse rankings from Gemini output
  parseRankings(text) {
    const rankings = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^(\d+)\. (\w+)/); // Matches "1. Meta", "2. TikTok", etc.
      
      if (match) {
        const rank = parseInt(match[1]);
        const company = match[2];
        
        // Get description (next few lines until next ranking or end)
        let description = '';
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^\d+\./)) break; // Stop at next ranking
          if (lines[j].trim()) {
            description += lines[j].trim() + ' ';
          }
        }
        
        rankings.push({
          rank: rank,
          company: company,
          description: description.trim()
        });
      }
    }
    
    return rankings;
  }

  async getOutput() {
    return await this.getSummary();
  }

  async getOutputWithContext(context) {
    return await this.getSummary(context);
  }
}

const summarizationAgent = new SummarizationAgent();
export default summarizationAgent;