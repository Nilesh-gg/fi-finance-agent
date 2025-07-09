const express = require('express');
const { generateFinancialInsights } = require('../config/vertexai');
const { authenticateUser } = require('../middleware/auth');
const { saveConversation, getUserConversations } = require('../config/firebase');
const FiMcpService = require('../services/fiMcpService');
const { logger } = require('../utils/logger');

const router = express.Router();
const fiMcpService = new FiMcpService();

/**
 * POST /api/chat/query
 * Process a natural language financial query
 */
router.post('/query', authenticateUser, async (req, res) => {
  try {
    const { query, fiToken } = req.body;
    const userId = req.user.uid;

    if (!query || !fiToken) {
      return res.status(400).json({
        error: 'Query and Fi token are required'
      });
    }

    // Validate Fi token
    const isValidToken = await fiMcpService.validateFiToken(fiToken);
    if (!isValidToken) {
      return res.status(401).json({
        error: 'Invalid Fi token'
      });
    }

    // Get user's financial data
    logger.info(`Processing query for user: ${userId}`);
    const financialData = await fiMcpService.getUserFinancialData(userId, fiToken);

    // Get conversation history for context
    const conversationHistory = await getUserConversations(userId, 5);

    // Generate AI response using Gemini
    const aiResponse = await generateFinancialInsights(
      query,
      financialData,
      conversationHistory
    );

    // Save conversation to Firestore
    const conversationData = {
      query,
      response: aiResponse.response,
      metadata: aiResponse.metadata,
      financialDataSnapshot: {
        netWorth: financialData.netWorth?.total || 0,
        assets: financialData.assets?.total || 0,
        liabilities: financialData.liabilities?.total || 0
      }
    };

    const conversationId = await saveConversation(userId, conversationData);

    res.json({
      success: true,
      conversationId,
      response: aiResponse.response,
      metadata: aiResponse.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error processing chat query:', error);
    res.status(500).json({
      error: 'Failed to process your query',
      details: error.message
    });
  }
});

/**
 * GET /api/chat/history
 * Get user's conversation history
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await getUserConversations(userId, limit);

    res.json({
      success: true,
      conversations,
      total: conversations.length
    });

  } catch (error) {
    logger.error('Error fetching conversation history:', error);
    res.status(500).json({
      error: 'Failed to fetch conversation history',
      details: error.message
    });
  }
});

/**
 * POST /api/chat/follow-up
 * Process a follow-up question in the context of a conversation
 */
router.post('/follow-up', authenticateUser, async (req, res) => {
  try {
    const { query, conversationId, fiToken } = req.body;
    const userId = req.user.uid;

    if (!query || !conversationId || !fiToken) {
      return res.status(400).json({
        error: 'Query, conversation ID, and Fi token are required'
      });
    }

    // Validate Fi token
    const isValidToken = await fiMcpService.validateFiToken(fiToken);
    if (!isValidToken) {
      return res.status(401).json({
        error: 'Invalid Fi token'
      });
    }

    // Get user's financial data
    const financialData = await fiMcpService.getUserFinancialData(userId, fiToken);

    // Get extended conversation history for better context
    const conversationHistory = await getUserConversations(userId, 10);

    // Generate follow-up response
    const aiResponse = await generateFinancialInsights(
      query,
      financialData,
      conversationHistory
    );

    // Save follow-up conversation
    const conversationData = {
      query,
      response: aiResponse.response,
      metadata: aiResponse.metadata,
      isFollowUp: true,
      parentConversationId: conversationId,
      financialDataSnapshot: {
        netWorth: financialData.netWorth?.total || 0,
        assets: financialData.assets?.total || 0,
        liabilities: financialData.liabilities?.total || 0
      }
    };

    const newConversationId = await saveConversation(userId, conversationData);

    res.json({
      success: true,
      conversationId: newConversationId,
      response: aiResponse.response,
      metadata: aiResponse.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error processing follow-up query:', error);
    res.status(500).json({
      error: 'Failed to process your follow-up query',
      details: error.message
    });
  }
});

/**
 * POST /api/chat/scenario
 * Process a financial scenario simulation
 */
router.post('/scenario', authenticateUser, async (req, res) => {
  try {
    const { scenario, parameters, fiToken } = req.body;
    const userId = req.user.uid;

    if (!scenario || !fiToken) {
      return res.status(400).json({
        error: 'Scenario description and Fi token are required'
      });
    }

    // Validate Fi token
    const isValidToken = await fiMcpService.validateFiToken(fiToken);
    if (!isValidToken) {
      return res.status(401).json({
        error: 'Invalid Fi token'
      });
    }

    // Get user's financial data
    const financialData = await fiMcpService.getUserFinancialData(userId, fiToken);

    // Create scenario-specific prompt
    const scenarioPrompt = `
SCENARIO SIMULATION REQUEST:
${scenario}

${parameters ? `PARAMETERS: ${JSON.stringify(parameters)}` : ''}

Please provide a detailed analysis of this scenario based on the user's current financial situation. Include:
1. Impact on net worth and cash flow
2. Feasibility assessment
3. Recommended actions or adjustments
4. Risk analysis
5. Timeline and milestones
6. Alternative approaches if applicable

Use specific numbers from the user's financial data to make your analysis concrete and actionable.
`;

    // Generate scenario analysis
    const aiResponse = await generateFinancialInsights(
      scenarioPrompt,
      financialData,
      []
    );

    // Save scenario analysis
    const conversationData = {
      query: scenario,
      response: aiResponse.response,
      metadata: aiResponse.metadata,
      type: 'scenario',
      parameters: parameters || {},
      financialDataSnapshot: {
        netWorth: financialData.netWorth?.total || 0,
        assets: financialData.assets?.total || 0,
        liabilities: financialData.liabilities?.total || 0
      }
    };

    const conversationId = await saveConversation(userId, conversationData);

    res.json({
      success: true,
      conversationId,
      analysis: aiResponse.response,
      metadata: aiResponse.metadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error processing scenario simulation:', error);
    res.status(500).json({
      error: 'Failed to process scenario simulation',
      details: error.message
    });
  }
});

/**
 * GET /api/chat/suggestions
 * Get personalized conversation starters based on user's financial data
 */
router.get('/suggestions', authenticateUser, async (req, res) => {
  try {
    const { fiToken } = req.query;
    const userId = req.user.uid;

    if (!fiToken) {
      return res.status(400).json({
        error: 'Fi token is required'
      });
    }

    // Validate Fi token
    const isValidToken = await fiMcpService.validateFiToken(fiToken);
    if (!isValidToken) {
      return res.status(401).json({
        error: 'Invalid Fi token'
      });
    }

    // Get user's financial data
    const financialData = await fiMcpService.getUserFinancialData(userId, fiToken);

    // Generate personalized suggestions based on financial data
    const suggestions = generatePersonalizedSuggestions(financialData);

    res.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error generating suggestions:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      details: error.message
    });
  }
});

/**
 * Generate personalized conversation starters
 */
function generatePersonalizedSuggestions(financialData) {
  const suggestions = [];

  // Net worth related suggestions
  if (financialData.netWorth?.total > 0) {
    suggestions.push({
      category: 'Net Worth',
      question: `How is my net worth of ₹${financialData.netWorth.total.toLocaleString()} performing?`,
      icon: '💰'
    });
  }

  // Investment suggestions
  if (financialData.assets?.investments?.total > 0) {
    suggestions.push({
      category: 'Investments',
      question: `Which of my investments are underperforming the market?`,
      icon: '📈'
    });
  }

  // Debt management suggestions
  if (financialData.liabilities?.total > 0) {
    suggestions.push({
      category: 'Debt Management',
      question: `How can I optimize my debt repayment strategy?`,
      icon: '💳'
    });
  }

  // Savings suggestions
  if (financialData.monthlyFlow?.surplus > 0) {
    suggestions.push({
      category: 'Savings',
      question: `What should I do with my monthly surplus of ₹${financialData.monthlyFlow.surplus.toLocaleString()}?`,
      icon: '💰'
    });
  }

  // EPF suggestions
  if (financialData.epf?.balance > 0) {
    suggestions.push({
      category: 'Retirement Planning',
      question: `How much will my EPF be worth at retirement?`,
      icon: '🏖️'
    });
  }

  // Credit score suggestions
  if (financialData.creditScore?.score > 0) {
    suggestions.push({
      category: 'Credit Score',
      question: `How can I improve my credit score of ${financialData.creditScore.score}?`,
      icon: '📊'
    });
  }

  // Goal-based suggestions
  suggestions.push(
    {
      category: 'Goal Planning',
      question: 'Can I afford a ₹50L home loan in 2 years?',
      icon: '🏠'
    },
    {
      category: 'Retirement Planning',
      question: 'How much money will I have at 40?',
      icon: '📅'
    },
    {
      category: 'Investment Strategy',
      question: 'Should I increase my SIP amount?',
      icon: '📈'
    }
  );

  return suggestions.slice(0, 6); // Return top 6 suggestions
}

module.exports = router;
