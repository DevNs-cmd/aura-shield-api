# AURA-SHIELD — Agentic Scam Intelligence API

Production-grade API for scam detection and user safety, built for the India AI Impact Buildathon.

## Overview

AURA-SHIELD is a state-of-the-art scam detection API that uses multi-agent intelligence to analyze suspicious messages and return actionable scam intelligence. The system employs deterministic logic to identify various types of scams including bank impersonation, lottery fraud, OTP scams, and more.

## Features

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