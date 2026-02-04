const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS configuration - allow all origins for evaluator compatibility
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// JSON parser with explicit error handling
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('[ERROR] JSON Parse Error:', err.message);
    return res.status(400).json({
      error: 'INVALID_REQUEST_BODY',
      message: 'Invalid JSON in request body'
    });
  }
  next(err);
});

// ============================================================================
// CONFIGURATION & SETUP
// ============================================================================

// API Keys from environment (comma-separated, trimmed)
const API_KEYS = process.env.API_KEYS
  ? process.env.API_KEYS.split(',')
      .map(k => k.trim())
      .filter(Boolean)
  : ['sk-aura-default-key'];

console.log(`[INIT] API Keys loaded: ${API_KEYS.length} key(s)`);

// Import analysis logic
const { analyzeScamMessage } = require('./scamAnalyzer');

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Validates API key from Bearer token or x-api-key header
 */
const authenticateApiKey = (req, res, next) => {
  let apiKey = null;

  // Check Bearer token first
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7).trim();
  }

  // Check x-api-key header
  if (!apiKey && req.headers['x-api-key']) {
    apiKey = String(req.headers['x-api-key']).trim();
  }

  if (!apiKey) {
    console.warn('[AUTH] Missing API key');
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing API key. Use Authorization: Bearer <key> or x-api-key: <key>'
    });
  }

  if (!API_KEYS.includes(apiKey)) {
    console.warn(`[AUTH] Invalid API key attempted`);
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Invalid API key'
    });
  }

  next();
};

// ============================================================================
// ENDPOINTS
// ============================================================================

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  console.log('[/health] GET request received');
  res.status(200).json({
    status: 'ok',
    service: 'AuraShield API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /analyze - Main analysis endpoint
 * Validates: sessionId, message (object with sender + text), source
 */
app.post('/analyze', authenticateApiKey, async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('[/analyze] POST request received');
    console.log('[/analyze] Body preview:', JSON.stringify(req.body).substring(0, 120));

    const body = req.body || {};

    // ========================================================================
    // VALIDATION LAYER
    // ========================================================================

    // Validate sessionId (string, required)
    if (!body.sessionId) {
      console.warn('[/analyze] Validation failed: Missing sessionId');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: sessionId'
      });
    }

    if (typeof body.sessionId !== 'string' || body.sessionId.trim() === '') {
      console.warn('[/analyze] Validation failed: sessionId must be non-empty string');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Field sessionId must be a non-empty string'
      });
    }

    // Validate message object (required)
    if (!body.message || typeof body.message !== 'object' || Array.isArray(body.message)) {
      console.warn('[/analyze] Validation failed: message must be an object');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message (must be an object)'
      });
    }

    // Validate message.sender (string, required)
    if (!body.message.sender) {
      console.warn('[/analyze] Validation failed: Missing message.sender');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message.sender'
      });
    }

    if (typeof body.message.sender !== 'string' || body.message.sender.trim() === '') {
      console.warn('[/analyze] Validation failed: message.sender must be non-empty string');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Field message.sender must be a non-empty string'
      });
    }

    // Validate message.text (string, required)
    if (!body.message.text) {
      console.warn('[/analyze] Validation failed: Missing message.text');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: message.text'
      });
    }

    if (typeof body.message.text !== 'string' || body.message.text.trim() === '') {
      console.warn('[/analyze] Validation failed: message.text must be non-empty string');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Field message.text must be a non-empty string'
      });
    }

    // Validate source (string, required, specific values)
    if (!body.source) {
      console.warn('[/analyze] Validation failed: Missing source');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Missing required field: source'
      });
    }

    if (typeof body.source !== 'string') {
      console.warn('[/analyze] Validation failed: source must be a string');
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Field source must be a string'
      });
    }

    const validSources = ['sms', 'email', 'chat', 'unknown'];
    const sourceLower = body.source.toLowerCase();
    if (!validSources.includes(sourceLower)) {
      console.warn(`[/analyze] Validation failed: Invalid source "${body.source}"`);
      return res.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: `Field source must be one of: ${validSources.join(', ')}`
      });
    }

    // ========================================================================
    // PROCESSING
    // ========================================================================

    console.log(`[/analyze] Validation passed | sessionId: ${body.sessionId} | source: ${sourceLower}`);

    // Call analysis engine
    const analysisResult = await analyzeScamMessage(
      body.message.text.trim(),
      sourceLower
    );

    if (!analysisResult) {
      throw new Error('Analysis returned null or undefined');
    }

    const processingTime = Date.now() - startTime;
    console.log(`[/analyze] Analysis complete in ${processingTime}ms | is_scam: ${analysisResult.is_scam} | confidence: ${analysisResult.confidence_score}`);

    // ========================================================================
    // RESPONSE
    // ========================================================================

    res.status(200).json({
      status: 'success',
      message: 'Request processed successfully',
      data: {
        sessionId: body.sessionId,
        sender: body.message.sender,
        source: sourceLower,
        timestamp: new Date().toISOString(),
        analysis: {
          is_scam: analysisResult.is_scam || false,
          confidence_score: analysisResult.confidence_score || 0,
          scam_type: analysisResult.scam_type || 'non_scam',
          risk_level: analysisResult.risk_level || 'low',
          cognitive_exploitation: analysisResult.cognitive_exploitation || {
            urgency: 0,
            fear: 0,
            reward_bait: 0,
            authority_bias: 0
          },
          reasoning: Array.isArray(analysisResult.reasoning)
            ? analysisResult.reasoning
            : ['Analysis complete'],
          extracted_entities: analysisResult.extracted_entities || {
            organization: null,
            intent: 'general',
            channel: sourceLower
          },
          recommendation: analysisResult.recommendation || 'No specific recommendation'
        }
      }
    });

  } catch (error) {
    console.error('[/analyze] Unexpected error:', error);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred during processing. Please try again.'
    });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * 404 Handler - Route not found
 */
app.use('*', (req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

/**
 * Global error handler - Catches all errors
 */
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = parseInt(process.env.PORT, 10) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   AURA-SHIELD Scam Intelligence API   ║
╚════════════════════════════════════════╝

✓ Server running on port ${PORT}
✓ Environment: ${NODE_ENV}
✓ API Keys configured: ${API_KEYS.length} key(s)

Endpoints:
  GET  http://localhost:${PORT}/health
  POST http://localhost:${PORT}/analyze

Auth Headers Supported:
  • Authorization: Bearer <api-key>
  • x-api-key: <api-key>

Started: ${new Date().toISOString()}
════════════════════════════════════════
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});

module.exports = app;