# AURA-SHIELD – Agentic Scam Intelligence API

Production-ready Node.js + Express API for detecting scam messages using advanced psychological exploitation analysis and multi-agent intelligence.

## ✅ Features

✓ **Robust API Validation** – Comprehensive request validation with clear error messages  
✓ **Dual Authentication** – Supports Bearer tokens and x-api-key headers  
✓ **Production-Ready** – Error handling, graceful shutdown, comprehensive logging  
✓ **CORS Enabled** – Cross-origin request support for web clients  
✓ **Scam Detection** – Multi-agent analysis system for fraud identification  
✓ **Psychological Analysis** – Detects urgency, fear, reward baiting, authority bias  
✓ **Render Deployment** – Fully compatible with Render.com hosting  
✓ **Fast Analysis** – ~1-2ms per message  
✓ **Deterministic** – No randomness, fully reproducible results  

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/DevNs-cmd/aura-shield-api.git
cd aura-shield-api
npm install
```

### Configuration

Create `.env`:
```env
PORT=3000
NODE_ENV=production
API_KEYS=sk-aura-test-key-123
```

### Run

```bash
npm start
```

---

## 📋 API Endpoints

### GET /health

Health check endpoint.

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "AuraShield API",
  "version": "1.0.0",
  "timestamp": "2026-02-04T14:26:53.344Z"
}
```

---

### POST /analyze

Analyzes a message for scam indicators.

**Authentication:** 
- `Authorization: Bearer sk-aura-test-key-123`  
- OR `x-api-key: sk-aura-test-key-123`

**Request:**
```json
{
  "sessionId": "sess_12345",
  "message": {
    "sender": "+1234567890",
    "text": "Your account suspended verify immediately click link"
  },
  "source": "sms"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Request processed successfully",
  "data": {
    "sessionId": "sess_12345",
    "sender": "+1234567890",
    "source": "sms",
    "timestamp": "2026-02-04T14:27:09.366Z",
    "analysis": {
      "is_scam": true,
      "confidence_score": 0.95,
      "scam_type": "bank_impersonation",
      "risk_level": "high",
      "cognitive_exploitation": {
        "urgency": 0.15,
        "fear": 0.30,
        "reward_bait": 0.0,
        "authority_bias": 0.0
      },
      "reasoning": [
        "Detected scam pattern: bank impersonation",
        "Suspicious intent detected: otp_theft, link_click"
      ],
      "extracted_entities": {
        "organization": null,
        "intent": "verification_request",
        "channel": "sms"
      },
      "recommendation": "Exercise extreme caution. Do not share personal information or click links."
    }
  }
}
```

---

## 🔐 Error Responses

**Missing Field (400):**
```json
{
  "error": "INVALID_REQUEST_BODY",
  "message": "Missing required field: sessionId"
}
```

**Missing Auth (401):**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Missing API key. Use Authorization: Bearer <key> or x-api-key: <key>"
}
```

**Invalid Auth (403):**
```json
{
  "error": "FORBIDDEN",
  "message": "Invalid API key"
}
```

**Server Error (500):**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred during processing. Please try again."
}
```

---

## 🧪 Testing

### Using curl
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Authorization: Bearer sk-aura-test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sess_001",
    "message": {
      "sender": "+919876543210",
      "text": "Your account suspended verify immediately click link"
    },
    "source": "sms"
  }'
```

### Using PowerShell
```powershell
$headers = @{ 'x-api-key' = 'sk-aura-test-key-123' }
$body = @{
  'sessionId' = 'sess_001'
  'message' = @{ 'sender' = '+919876543210'; 'text' = 'Account suspended click link' }
  'source' = 'sms'
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/analyze -Method POST `
  -Headers $headers -Body $body -ContentType application/json
```

---

## 🌐 Render Deployment

1. Connect GitHub repo to Render
2. Add environment variables:
   ```
   PORT=10000
   NODE_ENV=production
   API_KEYS=sk-aura-test-key-123
   ```
3. Render auto-deploys via `npm install` + `npm start`
4. Access: `https://your-service.onrender.com/health`

---

## 📊 Scam Detection Scoring

- **Strong Indicators**: 0.75–0.95 (high risk)
- **Medium Risk**: 0.40–0.65
- **Benign**: < 0.30
- **Max Score**: 0.95 (capped)

### High-Boost Phrases
- "account suspended"
- "verify immediately"
- "click link"
- "limited time"
- "kyc blocked"
- "otp required"

- **Multi-Agent Intelligence**: Uses Intent Agent, Psychological Exploit Agent, Context Agent, and Risk Aggregator
- **Real-time Analysis**: Fast, deterministic analysis without heavy ML inference
- **Comprehensive Output**: Detailed scam intelligence with confidence scores and reasoning
- **Secure Authentication**: API key-based authentication via Bearer tokens
- **Production Ready**: Optimized for deployment on Render, Railway, or Vercel

## API Endpoints

### Health Check
```
GET /health
```
Returns service status information.

### Message Analysis
```
POST /analyze
```
Analyzes a message for scam indicators.

**Headers:**
- `Authorization: Bearer <API_KEY>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```json
{
  "message": "<scam or non-scam text>",
  "source": "sms | email | chat | unknown"
}
```

**Response Format:**
```json
{
  "is_scam": boolean,
  "confidence_score": number,
  "scam_type": string,
  "risk_level": "low | medium | high | critical",
  "cognitive_exploitation": {
    "urgency": number,
    "fear": number,
    "reward_bait": number,
    "authority_bias": number
  },
  "reasoning": string[],
  "extracted_entities": {
    "organization": string | null,
    "intent": string,
    "channel": string
  },
  "recommendation": string
}
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aura-shield
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see `.env` file):
```bash
API_KEYS=your_api_key_1,your_api_key_2
PORT=3000
```

## Running Locally

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Deployment

### Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Add environment variables in the Render dashboard

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Create a new project from your repository
3. Add environment variables in the Railway dashboard
4. Deploy the project

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Import your project
3. Set the output directory and build settings
4. Add environment variables in the Vercel dashboard

## Example Usage

### Test the Health Endpoint
```bash
curl -X GET http://localhost:3000/health
```

### Analyze a Suspicious Message
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Authorization: Bearer sk-aura-test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "URGENT: Your bank account will be suspended! Click here to verify your credentials immediately: fake-bank-login.com",
    "source": "sms"
  }'
```

### Another Example - Lottery Scam
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Authorization: Bearer sk-aura-test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Congratulations! You have won Rs. 10,00,000 in the lottery. Claim your prize now by depositing Rs. 10,000 processing fees.",
    "source": "email"
  }'
```

### Non-Scam Example
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Authorization: Bearer sk-aura-test-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi, are you free for a meeting tomorrow at 10 AM?",
    "source": "chat"
  }'
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Successful analysis
- `400`: Bad request (missing required fields)
- `401`: Unauthorized (missing authorization header)
- `403`: Forbidden (invalid API key)
- `404`: Route not found
- `500`: Internal server error

## Security

- API key authentication required for all analysis requests
- No personal data is stored or logged
- Rate limiting should be implemented at the infrastructure level
- All responses are in JSON format for predictable consumption

## Architecture

The system uses a multi-agent approach:

1. **Intent Agent**: Detects attacker goals (OTP theft, money fraud, etc.)
2. **Psychological Exploit Agent**: Scores manipulation tactics (urgency, fear, etc.)
3. **Context Agent**: Analyzes channel, tone, and impersonated entities
4. **Risk Aggregator**: Combines all signals into final assessment

## Technologies Used

- Node.js
- Express.js
- CORS
- Dotenv for environment configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.