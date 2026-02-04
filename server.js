const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());

// JSON parser with explicit error handling for malformed JSON
app.use(express.json({ limit: '10mb' }));

// Catch JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request: Invalid JSON in request body',
      code: 'INVALID_REQUEST_BODY'
    });
  }
  next(err);
});

// In-memory API keys store (in production, use a secure database)
// Read keys from env, split by comma and trim whitespace
const API_KEYS = process.env.API_KEYS
  ? process.env.API_KEYS.split(',').map(k => k.trim()).filter(Boolean)
  : [];

/**
 * Authentication middleware to validate API key
 * Supports both Bearer token and x-api-key header
 */
const authenticateApiKey = (req, res, next) => {
  let apiKey = null;
  
  // Check for Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  // Check for x-api-key header as fallback
  if (!apiKey && req.headers['x-api-key']) {
    apiKey = req.headers['x-api-key'];
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header',
      code: 'MISSING_AUTH_HEADER'
    });
  }

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
  console.log('[/health] Received GET request');
  // Health endpoint for evaluator: exact JSON contract
  res.status(200).json({
    status: 'ok',
    service: 'AuraShield API',
    version: '1.0.0'
  });
});

/**
 * Main analysis endpoint - Refactored for robust validation
 * Validates sessionId, message object (sender + text), and source
 */
app.post('/analyze', authenticateApiKey, async (req, res) => {
  try {
    console.log(`[/analyze] Received POST request | Body:`, JSON.stringify(req.body).substring(0, 150));
    
    const body = req.body || {};

    // Validation: sessionId (string)
    if (!body.sessionId) {
      console.warn(`[/analyze] Validation failed: Missing sessionId`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: sessionId'
      });
    }

    if (typeof body.sessionId !== 'string') {
      console.warn(`[/analyze] Validation failed: sessionId is not a string`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Invalid field: sessionId must be a string'
      });
    }

    // Validation: message object with sender and text
    if (!body.message) {
      console.warn(`[/analyze] Validation failed: Missing message object`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message'
      });
    }

    if (typeof body.message !== 'object' || Array.isArray(body.message)) {
      console.warn(`[/analyze] Validation failed: message is not an object`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Invalid field: message must be an object'
      });
    }

    if (!body.message.sender) {
      console.warn(`[/analyze] Validation failed: Missing message.sender`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message.sender'
      });
    }

    if (typeof body.message.sender !== 'string') {
      console.warn(`[/analyze] Validation failed: message.sender is not a string`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Invalid field: message.sender must be a string'
      });
    }

    if (!body.message.text) {
      console.warn(`[/analyze] Validation failed: Missing message.text`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message.text'
      });
    }

    if (typeof body.message.text !== 'string') {
      console.warn(`[/analyze] Validation failed: message.text is not a string`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Invalid field: message.text must be a string'
      });
    }

    // Validation: source (string)
    if (!body.source) {
      console.warn(`[/analyze] Validation failed: Missing source`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: source'
      });
    }

    if (typeof body.source !== 'string') {
      console.warn(`[/analyze] Validation failed: source is not a string`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Invalid field: source must be a string'
      });
    }

    // Validate source against allowed values
    const validSources = ['sms', 'email', 'chat', 'unknown'];
    if (!validSources.includes(body.source)) {
      console.warn(`[/analyze] Validation failed: Invalid source value: ${body.source}`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: `Invalid field: source must be one of ${validSources.join(', ')}`
      });
    }

    // All validations passed - perform scam analysis
    console.log(`[/analyze] Validation passed | sessionId: ${body.sessionId} | source: ${body.source}`);
    
    const analysisResult = await analyzeScamMessage(body.message.text, body.source);
    
    console.log(`[/analyze] Analysis complete | is_scam: ${analysisResult.is_scam} | confidence: ${analysisResult.confidence_score}`);

    // Return success response with analysis data
    res.status(200).json({
      status: 'success',
      message: 'Request processed',
      data: {
        sessionId: body.sessionId,
        sender: body.message.sender,
        source: body.source,
        analysis: analysisResult
      }
    });

  } catch (error) {
    console.error('[/analyze] Unexpected error:', error);
    // Return error response with proper structure
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred during processing'
    });
  }
});

// Error handling middleware (catches all errors passed via next(err))
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Ensure all error responses are JSON
  if (res.headersSent) {
    return next(err);
  }
  
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
  console.log(`\n=== AURA-SHIELD API Server ===`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Keys configured: ${API_KEYS.length > 0 ? 'Yes' : 'No'}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/analyze`);
  console.log(`\nAuth Headers Supported:`);
  console.log(`  - Authorization: Bearer <api-key>`);
  console.log(`  - x-api-key: <api-key>`);
  console.log(`============================\n`);
});

module.exports = app;