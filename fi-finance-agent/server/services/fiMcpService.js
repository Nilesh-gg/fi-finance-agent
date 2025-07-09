const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Fi MCP Server integration service
 * Handles all interactions with Fi's MCP API
 */
class FiMcpService {
  constructor() {
    this.baseUrl = process.env.FI_MCP_API_URL || 'https://api.fimoney.com/mcp';
    this.apiKey = process.env.FI_MCP_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('FI_MCP_API_KEY environment variable is required');
    }
    
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get user's financial data from Fi MCP
   */
  async getUserFinancialData(userId, fiToken) {
    try {
      logger.info(`Fetching financial data for user: ${userId}`);
      
      const response = await this.axiosInstance.get(`/userdata/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      if (!response.data) {
        throw new Error('No data received from Fi MCP');
      }
      
      // Normalize and structure the financial data
      const normalizedData = this.normalizeFinancialData(response.data);
      
      logger.info(`Successfully fetched financial data for user: ${userId}`);
      return normalizedData;
    } catch (error) {
      logger.error(`Error fetching financial data for user ${userId}:`, error);
      throw new Error('Failed to fetch financial data from Fi MCP');
    }
  }

  /**
   * Get user's assets from Fi MCP
   */
  async getUserAssets(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/assets/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeAssets(response.data);
    } catch (error) {
      logger.error(`Error fetching assets for user ${userId}:`, error);
      throw new Error('Failed to fetch assets data');
    }
  }

  /**
   * Get user's liabilities from Fi MCP
   */
  async getUserLiabilities(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/liabilities/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeLiabilities(response.data);
    } catch (error) {
      logger.error(`Error fetching liabilities for user ${userId}:`, error);
      throw new Error('Failed to fetch liabilities data');
    }
  }

  /**
   * Get user's net worth from Fi MCP
   */
  async getUserNetWorth(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/networth/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeNetWorth(response.data);
    } catch (error) {
      logger.error(`Error fetching net worth for user ${userId}:`, error);
      throw new Error('Failed to fetch net worth data');
    }
  }

  /**
   * Get user's credit score from Fi MCP
   */
  async getUserCreditScore(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/credit-score/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeCreditScore(response.data);
    } catch (error) {
      logger.error(`Error fetching credit score for user ${userId}:`, error);
      throw new Error('Failed to fetch credit score data');
    }
  }

  /**
   * Get user's EPF data from Fi MCP
   */
  async getUserEPF(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/epf/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeEPF(response.data);
    } catch (error) {
      logger.error(`Error fetching EPF for user ${userId}:`, error);
      throw new Error('Failed to fetch EPF data');
    }
  }

  /**
   * Get user's investment portfolio from Fi MCP
   */
  async getUserInvestments(userId, fiToken) {
    try {
      const response = await this.axiosInstance.get(`/investments/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return this.normalizeInvestments(response.data);
    } catch (error) {
      logger.error(`Error fetching investments for user ${userId}:`, error);
      throw new Error('Failed to fetch investments data');
    }
  }

  /**
   * Get user's transaction history from Fi MCP
   */
  async getUserTransactions(userId, fiToken, limit = 100, days = 30) {
    try {
      const response = await this.axiosInstance.get(`/transactions/${userId}`, {
        headers: {
          'Fi-Token': fiToken
        },
        params: {
          limit,
          days
        }
      });
      
      return this.normalizeTransactions(response.data);
    } catch (error) {
      logger.error(`Error fetching transactions for user ${userId}:`, error);
      throw new Error('Failed to fetch transaction data');
    }
  }

  /**
   * Normalize complete financial data structure
   */
  normalizeFinancialData(rawData) {
    return {
      userId: rawData.userId,
      lastUpdated: new Date().toISOString(),
      netWorth: this.normalizeNetWorth(rawData.netWorth),
      assets: this.normalizeAssets(rawData.assets),
      liabilities: this.normalizeLiabilities(rawData.liabilities),
      creditScore: this.normalizeCreditScore(rawData.creditScore),
      monthlyFlow: this.normalizeMonthlyFlow(rawData.monthlyFlow),
      investments: this.normalizeInvestments(rawData.investments),
      epf: this.normalizeEPF(rawData.epf),
      recentTransactions: this.normalizeTransactions(rawData.recentTransactions)
    };
  }

  /**
   * Normalize net worth data
   */
  normalizeNetWorth(netWorthData) {
    if (!netWorthData) return null;
    
    return {
      total: netWorthData.total || 0,
      assets: netWorthData.assets || 0,
      liabilities: netWorthData.liabilities || 0,
      growthRate: netWorthData.growthRate || 0,
      lastMonthChange: netWorthData.lastMonthChange || 0
    };
  }

  /**
   * Normalize assets data
   */
  normalizeAssets(assetsData) {
    if (!assetsData) return null;
    
    return {
      total: assetsData.total || 0,
      bankAccounts: {
        total: assetsData.bankAccounts?.total || 0,
        accounts: assetsData.bankAccounts?.accounts || []
      },
      investments: {
        total: assetsData.investments?.total || 0,
        mutualFunds: {
          total: assetsData.investments?.mutualFunds?.total || 0,
          funds: assetsData.investments?.mutualFunds?.funds || []
        },
        stocks: {
          total: assetsData.investments?.stocks?.total || 0,
          holdings: assetsData.investments?.stocks?.holdings || []
        },
        epf: {
          total: assetsData.investments?.epf?.total || 0,
          balance: assetsData.investments?.epf?.balance || 0
        },
        ppf: {
          total: assetsData.investments?.ppf?.total || 0,
          balance: assetsData.investments?.ppf?.balance || 0
        }
      },
      realEstate: {
        total: assetsData.realEstate?.total || 0,
        properties: assetsData.realEstate?.properties || []
      },
      otherAssets: {
        total: assetsData.otherAssets?.total || 0,
        items: assetsData.otherAssets?.items || []
      }
    };
  }

  /**
   * Normalize liabilities data
   */
  normalizeLiabilities(liabilitiesData) {
    if (!liabilitiesData) return null;
    
    return {
      total: liabilitiesData.total || 0,
      loans: {
        total: liabilitiesData.loans?.total || 0,
        homeLoan: {
          outstanding: liabilitiesData.loans?.homeLoan?.outstanding || 0,
          emi: liabilitiesData.loans?.homeLoan?.emi || 0,
          interestRate: liabilitiesData.loans?.homeLoan?.interestRate || 0
        },
        personalLoan: {
          outstanding: liabilitiesData.loans?.personalLoan?.outstanding || 0,
          emi: liabilitiesData.loans?.personalLoan?.emi || 0,
          interestRate: liabilitiesData.loans?.personalLoan?.interestRate || 0
        },
        carLoan: {
          outstanding: liabilitiesData.loans?.carLoan?.outstanding || 0,
          emi: liabilitiesData.loans?.carLoan?.emi || 0,
          interestRate: liabilitiesData.loans?.carLoan?.interestRate || 0
        }
      },
      creditCards: {
        total: liabilitiesData.creditCards?.total || 0,
        cards: liabilitiesData.creditCards?.cards || []
      }
    };
  }

  /**
   * Normalize credit score data
   */
  normalizeCreditScore(creditScoreData) {
    if (!creditScoreData) return null;
    
    return {
      score: creditScoreData.score || 0,
      rating: creditScoreData.rating || 'N/A',
      lastUpdated: creditScoreData.lastUpdated || new Date().toISOString(),
      factors: creditScoreData.factors || []
    };
  }

  /**
   * Normalize monthly cash flow data
   */
  normalizeMonthlyFlow(monthlyFlowData) {
    if (!monthlyFlowData) return null;
    
    return {
      income: monthlyFlowData.income || 0,
      expenses: monthlyFlowData.expenses || 0,
      surplus: monthlyFlowData.surplus || 0,
      savingsRate: monthlyFlowData.savingsRate || 0,
      expenseCategories: monthlyFlowData.expenseCategories || []
    };
  }

  /**
   * Normalize investments data
   */
  normalizeInvestments(investmentsData) {
    if (!investmentsData) return null;
    
    return {
      total: investmentsData.total || 0,
      mutualFunds: investmentsData.mutualFunds || [],
      stocks: investmentsData.stocks || [],
      bonds: investmentsData.bonds || [],
      performance: investmentsData.performance || {}
    };
  }

  /**
   * Normalize EPF data
   */
  normalizeEPF(epfData) {
    if (!epfData) return null;
    
    return {
      balance: epfData.balance || 0,
      monthlyContribution: epfData.monthlyContribution || 0,
      employerContribution: epfData.employerContribution || 0,
      interestRate: epfData.interestRate || 0,
      projectedMaturity: epfData.projectedMaturity || 0
    };
  }

  /**
   * Normalize transactions data
   */
  normalizeTransactions(transactionsData) {
    if (!transactionsData || !Array.isArray(transactionsData)) return [];
    
    return transactionsData.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount || 0,
      type: transaction.type || 'unknown',
      category: transaction.category || 'others',
      description: transaction.description || '',
      date: transaction.date || new Date().toISOString(),
      account: transaction.account || 'unknown'
    }));
  }

  /**
   * Validate Fi token
   */
  async validateFiToken(fiToken) {
    try {
      const response = await this.axiosInstance.get('/validate-token', {
        headers: {
          'Fi-Token': fiToken
        }
      });
      
      return response.data.valid === true;
    } catch (error) {
      logger.error('Error validating Fi token:', error);
      return false;
    }
  }
}

module.exports = FiMcpService;
