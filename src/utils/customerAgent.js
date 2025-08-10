import summarizationAgent from './summarizationAgent.js';
import platformDemographics from '../data/platformDemographics.json';

class CustomerAgent {
  constructor() {
    this.geminiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.apiKeyAvailable = !!this.geminiKey;
    this.cachedSummary = null; // Store summary in memory
    this.summaryLoaded = false; // Track if summary has been loaded
    
    // Demographic collection state
    this.demographicData = {
      age: null,
      gender: null,
      location: null,
      income: null,
      profession: null
    };
    this.currentDemographicStep = 'age'; // Track which demographic we're collecting
    this.isCollectingDemographics = false;
    
    // Define demographic options
    this.demographicOptions = {
      age: [
        '13–17 (Teen)',
        '18–24 (Young Adult / Gen Z)',
        '25–34 (Early Career / Younger Millennial)',
        '35–44 (Mid Career / Older Millennial + Gen X)',
        '45–54 (Experienced Professional / Older Gen X)',
        '55–64 (Late Career / Early Retiree)',
        '65+ (Senior)',
        'Don\'t know'
      ],
      gender: [
        'Male',
        'Female',
        'Non-binary / Other',
        'Prefer not to say',
        'Don\'t know'
      ],
      location: [
        'Urban',
        'Suburban',
        'Rural',
        'Domestic (same country)',
        'International (cross-border audience)',
        'Specific region: North America',
        'Specific region: Western Europe',
        'Specific region: APAC',
        'Specific region: LATAM',
        'Specific region: Middle East & Africa',
        'Don\'t know'
      ],
      income: [
        'Low income (<$30k)',
        'Lower-middle ($30k–$50k)',
        'Middle ($50k–$75k)',
        'Upper-middle ($75k–$150k)',
        'High income ($150k+)',
        'Don\'t know'
      ],
      profession: [
        'Student',
        'Entry-level / Early career (0–3 yrs)',
        'Mid-level professional (4–10 yrs)',
        'Senior professional / Manager (10+ yrs)',
        'Executive / C-suite',
        'Self-employed / Entrepreneur',
        'Skilled trade / Manual labor',
        'Unemployed / Career transition',
        'Don\'t know'
      ]
    };
  }

  // Check if API key is available
  isApiKeyAvailable() {
    return this.apiKeyAvailable;
  }

  // Get initial welcome message
  getWelcomeMessage() {
    return {
      type: 'bot',
      content: 'This chatbot will help adapt to your specific targeted audience. Do you want to start? (Type "yes" to begin)',
      timestamp: new Date().toLocaleTimeString()
    };
  }

  // Start demographic collection
  startDemographicCollection() {
    this.isCollectingDemographics = true;
    this.currentDemographicStep = 'age';
    return this.getDemographicQuestion('age');
  }

  // Get demographic question for current step
  getDemographicQuestion(step) {
    const options = this.demographicOptions[step];
    
    const questions = {
      age: `What's your target audience age range? Please select one of the following options:`,
      gender: `What's your target audience gender? Please select one of the following options:`,
      location: `What's your target audience location? Please select one of the following options:`,
      income: `What's your target audience income level? Please select one of the following options:`,
      profession: `What's your target audience profession? Please select one of the following options:`
    };
    
    return {
      type: 'bot',
      content: questions[step],
      timestamp: new Date().toLocaleTimeString(),
      buttons: options, // Add buttons array to the message
      demographicStep: step // Track which demographic step this is for
    };
  }

  // Process demographic button response
  // Process demographic button response
  processDemographicButtonResponse(selectedOption, step) {
    // 1. SAVE TO CONTEXT - Store the selected option
    this.demographicData[step] = selectedOption;
    
    // 2. MOVE TO NEXT QUESTION - Progress through steps
    const steps = ['age', 'gender', 'location', 'income', 'profession'];
    const currentIndex = steps.indexOf(step);
    
    if (currentIndex < steps.length - 1) {
      // Move to next demographic question
      this.currentDemographicStep = steps[currentIndex + 1];
      return this.getDemographicQuestion(this.currentDemographicStep);
    } else {
      // 3. ALL COMPLETE - Finished collecting all demographics
      this.isCollectingDemographics = false;
      return this.completeDemographicCollection();
    }
  }

  // Process demographic response
  processDemographicResponse(inputMessage) {
    const choice = parseInt(inputMessage.trim());
    const options = this.demographicOptions[this.currentDemographicStep];
    
    if (isNaN(choice) || choice < 1 || choice > options.length) {
      return {
        type: 'bot',
        content: `Please enter a valid number between 1 and ${options.length}.`,
        timestamp: new Date().toLocaleTimeString()
      };
    }
    
    // Store the selected option
    this.demographicData[this.currentDemographicStep] = options[choice - 1];
    
    // Move to next step
    const steps = ['age', 'gender', 'location', 'income', 'profession'];
    const currentIndex = steps.indexOf(this.currentDemographicStep);
    
    if (currentIndex < steps.length - 1) {
      this.currentDemographicStep = steps[currentIndex + 1];
      return this.getDemographicQuestion(this.currentDemographicStep);
    } else {
      // Finished collecting demographics
      this.isCollectingDemographics = false;
      return this.completeDemographicCollection();
    }
  }

  // Complete demographic collection
  completeDemographicCollection() {
    const summary = Object.entries(this.demographicData)
      .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
      .join('\n');
    
    // Use the imported demographic data
    const recommendations = this.generatePlatformRecommendations(platformDemographics);
    
    // Set a flag to indicate we should auto-process the summary question
    this.shouldAutoSummarize = true;
    
    return {
      type: 'bot',
      content: `Great! I've collected your target audience information:\n\n${summary}\n\n${recommendations}`,
      timestamp: new Date().toLocaleTimeString(),
      autoFollowUp: true // Flag to indicate this message should trigger a follow-up
    };
  }
  
  // Updated generatePlatformRecommendations method
  generatePlatformRecommendations(platformData) {
    const userAge = this.demographicData.age;
    const userGender = this.demographicData.gender;
    const userLocation = this.demographicData.location;
    
    let recommendations = '🎯 **Platform Recommendations Based on Your Target Audience:**\n\n';
    
    // Calculate platform scores based on demographic alignment
    const platformScores = [];
    
    Object.entries(platformData).forEach(([platform, data]) => {
      let score = 0;
      let details = [];
      
      // Age alignment
      const ageMatch = data.demographics.age[userAge];
      if (ageMatch) {
        const percentage = parseInt(ageMatch.replace('%', ''));
        score += percentage;
        details.push(`Age match: ${ageMatch} of ${data.name} users`);
      }
      
      // Gender alignment
      const genderMatch = data.demographics.gender[userGender];
      if (genderMatch) {
        const percentage = parseInt(genderMatch.replace('%', ''));
        score += percentage * 0.5; // Weight gender less than age
        details.push(`Gender match: ${genderMatch} of ${data.name} users`);
      }
      
      // Location alignment (only Urban/Suburban/Rural)
      const locationMatch = data.demographics.location[userLocation];
      if (locationMatch && ['Urban', 'Suburban', 'Rural'].includes(userLocation)) {
        const percentage = parseInt(locationMatch.replace('%', ''));
        score += percentage * 0.3; // Weight location less
        details.push(`Location match: ${locationMatch} of ${data.name} users`);
      }
      
      platformScores.push({ platform, name: data.name, score, details });
    });
    
    // Sort platforms by score (highest first)
    platformScores.sort((a, b) => b.score - a.score);
    
    // Generate recommendations
    platformScores.forEach((platform, index) => {
      const priority = index === 0 ? '🥇 **TOP PRIORITY**' : 
                      index === 1 ? '🥈 **SECONDARY**' : 
                      index === 2 ? '🥉 **TERTIARY**' : '📊 **CONSIDER**';
      
      recommendations += `${priority}: **${platform.name}** (Match Score: ${platform.score.toFixed(1)})\n`;
      platform.details.forEach(detail => {
        recommendations += `   • ${detail}\n`;
      });
      recommendations += '\n';
    });
    
    return recommendations;
  }

  // Load summary from summarizationAgent
  async loadSummaryContext() {
    if (!this.summaryLoaded) {
      try {
        console.log('Loading AI summary context...');
        this.cachedSummary = await summarizationAgent.getSummary();
        this.summaryLoaded = true;
        console.log('AI summary context loaded successfully');
      } catch (error) {
        console.error('Error loading summary context:', error);
        this.cachedSummary = 'Unable to load platform analysis data.';
        this.summaryLoaded = true; // Mark as loaded to prevent retries
      }
    }
  }

  // Set cached summary (to be called from other components)
  setCachedSummary(summary) {
    this.cachedSummary = summary;
    this.summaryLoaded = true;
  }

  // Get cached summary
  getCachedSummary() {
    return this.cachedSummary;
  }

  // Send message to Gemini API
  async sendMessage(inputMessage) {
    if (!inputMessage.trim()) {
      throw new Error('Message cannot be empty');
    }

    if (!this.geminiKey) {
      throw new Error('API key not available');
    }

    // Check if user wants to start demographic collection
    // Only trigger if demographics haven't been collected yet
    const hasCollectedDemographics = Object.values(this.demographicData).some(value => value !== null);
    if (!this.isCollectingDemographics && !hasCollectedDemographics && (inputMessage.toLowerCase().includes('yes') || inputMessage.toLowerCase().includes('demographic') || inputMessage.toLowerCase().includes('target audience'))) {
      return this.startDemographicCollection();
    }

    // If we're in the middle of collecting demographics, process the response
    if (this.isCollectingDemographics) {
      return this.processDemographicResponse(inputMessage);
    }

    // Ensure summary context is loaded before processing the message
    await this.loadSummaryContext();

    try {
      // Build context with cached data and demographic information
      let contextPrompt = 'You are a budget optimization assistant. Help the user with their advertising budget questions.';
      
      if (this.cachedSummary) {
        contextPrompt += `\n\nHere is the current platform performance analysis and budget recommendations:\n${this.cachedSummary}\n\nUse this information to provide informed responses about budget optimization. Reference specific metrics, percentages, and platform performance data when relevant.`;
      }
      
      // Add demographic context if available
      if (Object.values(this.demographicData).some(value => value !== null)) {
        const demographicContext = Object.entries(this.demographicData)
          .filter(([key, value]) => value !== null)
          .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
          .join(', ');
        contextPrompt += `\n\nTarget audience demographics: ${demographicContext}. Use this demographic information to tailor your budget recommendations and platform suggestions.`;
      }
      
      contextPrompt += `\n\nUser question: ${inputMessage}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + this.geminiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: contextPrompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      return {
        type: 'bot',
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an error processing your request. Please check your API key and try again.',
        timestamp: new Date().toLocaleTimeString()
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please check your Gemini API key and internet connection.',
        timestamp: new Date().toLocaleTimeString()
      };
    }
  }

  // Create user message object
  createUserMessage(content) {
    return {
      type: 'user',
      content: content,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  // Get error message for missing API key
  getApiKeyErrorMessage() {
    return 'Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file.';
  }

  // Reset demographic collection (useful for testing or restarting)
  resetDemographics() {
    this.demographicData = {
      age: null,
      gender: null,
      location: null,
      income: null,
      profession: null
    };
    this.currentDemographicStep = 'age';
    this.isCollectingDemographics = false;
  }
}

// Export singleton instance
const customerAgent = new CustomerAgent();
export default customerAgent;