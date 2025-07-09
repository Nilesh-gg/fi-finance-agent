# Fi Personal Finance AI Agent

An AI-powered personal finance agent built using Fi's MCP Server and Google AI technologies. This agent provides deeply personalized financial insights through natural language conversations.

## Features

- **Natural Language Financial Queries**: Ask questions like "How much money will I have at 40?", "Can I afford a ₹50L home loan?", "Which SIPs underperformed the market?"
- **Comprehensive Financial Data**: Consumes structured data from Fi's MCP including assets, liabilities, net worth, credit scores, EPF, and more
- **AI-Powered Insights**: Uses Gemini to understand trends, suggest actions, simulate scenarios, and visualize outcomes
- **Secure & Private**: Complete user control with export capabilities
- **Multi-Modal Interface**: Support for both chat and voice interactions

## Architecture

The agent follows a secure, privacy-first architecture:

1. **Authentication Layer**: Firebase Auth with Google OAuth
2. **Data Layer**: Fi MCP Server integration for structured financial data
3. **AI Layer**: Vertex AI Gemini for intelligent processing
4. **Storage Layer**: Firestore for insights and user preferences
5. **Export Layer**: Google Sheets API and PDF generation

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **AI**: Google Vertex AI (Gemini)
- **Data Source**: Fi MCP Server
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Export**: Google Sheets API, PDF Kit

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with Vertex AI enabled
- Firebase project
- Fi MCP Server access

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see `.env.example`)
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FI_MCP_API_URL=https://api.fimoney.com/mcp
FI_MCP_API_KEY=your-fi-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## Usage

1. Sign in with your Google account
2. Connect your Fi account to access financial data
3. Start asking natural language questions about your finances
4. Export insights to Google Sheets or PDF

## License

MIT License
