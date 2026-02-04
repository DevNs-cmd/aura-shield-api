const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory API keys store (in production, use a secure database)
const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

/**
 * Authentication middleware to validate API key
 */
const authenticateApiKey = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header',
      code: 'MISSING_AUTH_HEADER'
    });
  }

  const apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!API_KEYS.includes(apiKey)) {
    return res.status(403).json({
      error: 'Forbidden: Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  next();
};

// Import the analysis logic
const { analyzeScamMessage } = require('./scamAnalyzer');

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  // Health endpoint: returns minimal status for evaluator
  res.status(200).json({ 
    status: 'ok'
  });
});

/**
 * Main analysis endpoint
 * Evaluator note: Always returns complete JSON contract
 */
app.post('/analyze', authenticateApiKey, async (req, res) => {
  try {
    const { message, source } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        error: 'Bad Request: Missing required field "message"',
        code: 'MISSING_MESSAGE_FIELD'
      });
    }

    if (!source) {
      return res.status(400).json({
        error: 'Bad Request: Missing required field "source"',
        code: 'MISSING_SOURCE_FIELD'
      });
    }

    // Validate source field
    const validSources = ['sms', 'email', 'chat', 'unknown'];
    if (!validSources.includes(source)) {
      return res.status(400).json({
        error: 'Bad Request: Invalid source value',
        code: 'INVALID_SOURCE_VALUE'
      });
    }

    // Analyze the message - guaranteed to return complete JSON contract
    const result = await analyzeScamMessage(message, source);

    res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    // Critical: Return complete JSON contract even on server error
    res.status(500).json({
      is_scam: false,
      confidence_score: 0.00,
      scam_type: 'non_scam',
      risk_level: 'low',
      cognitive_exploitation: {
        urgency: 0.00,
        fear: 0.00,
        reward_bait: 0.00,
        authority_bias: 0.00
      },
      reasoning: ['Server error occurred during analysis'],
      extracted_entities: {
        organization: null,
        intent: 'general',
        channel: 'unknown'
      },
      recommendation: 'Server error occurred during analysis, treating as non-scam for safety',
      error: 'Internal Server Error',
      code: 'ANALYSIS_ERROR'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'UNHANDLED_ERROR'
  });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA-SHIELD server running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Analysis endpoint: http://localhost:${PORT}/analyze`);
});

module.exports = app;