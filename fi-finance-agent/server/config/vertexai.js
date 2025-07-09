const { VertexAI } = require('@google-cloud/vertexai');
const { logger } = require('../utils/logger');

let vertexAI;
let generativeModel;

/**
 * Initialize Vertex AI
 */
async function initializeVertexAI() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
    }

    // Initialize Vertex AI
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    // Initialize Gemini model
    generativeModel = vertexAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    });

    logger.info('Vertex AI initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Vertex AI:', error);
    throw error;
  }
}

/**
 * Get Vertex AI instance
 */
function getVertexAI() {
  if (!vertexAI) {
    throw new Error('Vertex AI not initialized. Call initializeVertexAI() first.');
  }
  return vertexAI;
}

/**
 * Get Gemini model instance
 */
function getGeminiModel() {
  if (!generativeModel) {
    throw new Error('Gemini model not initialized. Call initializeVertexAI() first.');
  }
  return generativeModel;
}

/**
 * Generate financial insights using Gemini
 */
async function generateFinancialInsights(userQuery, financialData, conversationHistory = []) {
  try {
    const model = getGeminiModel();
    
    // Create context from financial data
    const contextPrompt = createFinancialContext(financialData);
    
    // Create conversation history context
    const historyContext = conversationHistory.length > 0 
      ? createConversationContext(conversationHistory)
      : '';
    
    // System prompt for financial advisor
    const systemPrompt = `You are a highly skilled AI financial advisor with expertise in personal finance, investment strategies, and financial planning. You have access to the user's complete financial data and should provide personalized, actionable insights.

Key guidelines:
1. Always provide specific, data-driven recommendations based on the user's actual financial situation
2. Use actual numbers from the user's financial data when making calculations
3. Consider the user's risk profile, age, and financial goals
4. Explain complex financial concepts in simple terms
5. Suggest specific actions the user can take
6. Always emphasize the importance of diversification and long-term planning
7. Format numbers in Indian currency (₹) and follow Indian financial market conventions
8. Provide realistic timelines and projections
9. Highlight both opportunities and risks

Current financial data context:
${contextPrompt}

${historyContext}

Remember to:
- Be specific and actionable
- Use the user's actual financial data
- Provide clear explanations for your recommendations
- Consider Indian tax implications where relevant
- Suggest specific investment instruments available in India`;

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userQuery}\n\nProvide a comprehensive, personalized response based on the user's financial situation.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    
    if (!response || !response.text()) {
      throw new Error('No response generated from Gemini');
    }

    return {
      response: response.text(),
      metadata: {
        model: 'gemini-1.5-pro',
        timestamp: new Date().toISOString(),
        tokenCount: response.usageMetadata?.totalTokenCount || 0
      }
    };
  } catch (error) {
    logger.error('Error generating financial insights:', error);
    throw new Error('Failed to generate financial insights');
  }
}

/**
 * Create financial context for the AI
 */
function createFinancialContext(financialData) {
  if (!financialData) {
    return 'No financial data available.';
  }

  let context = 'FINANCIAL DATA SUMMARY:\n\n';
  
  // Net worth summary
  if (financialData.netWorth) {
    context += `Net Worth: ₹${financialData.netWorth.total || 0}\n`;
    context += `Assets: ₹${financialData.netWorth.assets || 0}\n`;
    context += `Liabilities: ₹${financialData.netWorth.liabilities || 0}\n\n`;
  }

  // Assets breakdown
  if (financialData.assets) {
    context += 'ASSETS:\n';
    
    if (financialData.assets.bankAccounts) {
      context += `Bank Accounts: ₹${financialData.assets.bankAccounts.total || 0}\n`;
    }
    
    if (financialData.assets.investments) {
      context += `Investments: ₹${financialData.assets.investments.total || 0}\n`;
      
      if (financialData.assets.investments.mutualFunds) {
        context += `  - Mutual Funds: ₹${financialData.assets.investments.mutualFunds.total || 0}\n`;
      }
      
      if (financialData.assets.investments.stocks) {
        context += `  - Stocks: ₹${financialData.assets.investments.stocks.total || 0}\n`;
      }
      
      if (financialData.assets.investments.epf) {
        context += `  - EPF: ₹${financialData.assets.investments.epf.total || 0}\n`;
      }
      
      if (financialData.assets.investments.ppf) {
        context += `  - PPF: ₹${financialData.assets.investments.ppf.total || 0}\n`;
      }
    }
    
    if (financialData.assets.realEstate) {
      context += `Real Estate: ₹${financialData.assets.realEstate.total || 0}\n`;
    }
    
    context += '\n';
  }

  // Liabilities breakdown
  if (financialData.liabilities) {
    context += 'LIABILITIES:\n';
    
    if (financialData.liabilities.loans) {
      context += `Total Loans: ₹${financialData.liabilities.loans.total || 0}\n`;
      
      if (financialData.liabilities.loans.homeLoan) {
        context += `  - Home Loan: ₹${financialData.liabilities.loans.homeLoan.outstanding || 0}\n`;
      }
      
      if (financialData.liabilities.loans.personalLoan) {
        context += `  - Personal Loan: ₹${financialData.liabilities.loans.personalLoan.outstanding || 0}\n`;
      }
      
      if (financialData.liabilities.loans.carLoan) {
        context += `  - Car Loan: ₹${financialData.liabilities.loans.carLoan.outstanding || 0}\n`;
      }
    }
    
    if (financialData.liabilities.creditCards) {
      context += `Credit Card Outstanding: ₹${financialData.liabilities.creditCards.total || 0}\n`;
    }
    
    context += '\n';
  }

  // Credit score
  if (financialData.creditScore) {
    context += `Credit Score: ${financialData.creditScore.score || 'N/A'}\n`;
    context += `Credit Rating: ${financialData.creditScore.rating || 'N/A'}\n\n`;
  }

  // Monthly cash flow
  if (financialData.monthlyFlow) {
    context += 'MONTHLY CASH FLOW:\n';
    context += `Income: ₹${financialData.monthlyFlow.income || 0}\n`;
    context += `Expenses: ₹${financialData.monthlyFlow.expenses || 0}\n`;
    context += `Surplus: ₹${financialData.monthlyFlow.surplus || 0}\n\n`;
  }

  // Recent transactions (if available)
  if (financialData.recentTransactions) {
    context += 'RECENT FINANCIAL ACTIVITY:\n';
    context += `Total transactions analyzed: ${financialData.recentTransactions.length}\n\n`;
  }

  return context;
}

/**
 * Create conversation context
 */
function createConversationContext(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }

  let context = 'CONVERSATION HISTORY:\n\n';
  
  conversationHistory.slice(-5).forEach((conv, index) => {
    context += `${index + 1}. User: ${conv.query}\n`;
    context += `   AI: ${conv.response.substring(0, 200)}...\n\n`;
  });

  return context;
}

/**
 * Analyze financial trends using Gemini
 */
async function analyzeFinancialTrends(financialData, timeframe = '6months') {
  try {
    const model = getGeminiModel();
    
    const prompt = `Analyze the following financial data and provide insights on trends, patterns, and recommendations for the ${timeframe} period:

${createFinancialContext(financialData)}

Please provide:
1. Key financial trends observed
2. Areas of concern or improvement
3. Specific actionable recommendations
4. Future projections based on current trends
5. Risk assessment and mitigation strategies

Format your response in a structured manner with clear headings and bullet points.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    return {
      analysis: response.text(),
      metadata: {
        model: 'gemini-1.5-pro',
        timestamp: new Date().toISOString(),
        timeframe: timeframe
      }
    };
  } catch (error) {
    logger.error('Error analyzing financial trends:', error);
    throw new Error('Failed to analyze financial trends');
  }
}

module.exports = {
  initializeVertexAI,
  getVertexAI,
  getGeminiModel,
  generateFinancialInsights,
  analyzeFinancialTrends
};
