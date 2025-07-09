# Fi Finance Agent - Frontend Wireframes

This folder contains comprehensive wireframes for the Fi Personal Finance AI Agent frontend interface. The wireframes are designed to demonstrate the complete user experience flow and key features of the application.

## Wireframe Files

### 1. `dashboard.html` - Home / Dashboard (Post Login)
**Purpose**: Create trust and overview; invite natural-language financial queries

**Key Components**:
- **Header**: Greeting "Hi, Tanwi 👋" and user profile
- **Left Sidebar**: Navigation menu with Fi account connection status
- **Center Panel**: 
  - Suggested Prompts: "How's my net worth trending?", "Can I afford a ₹50L home loan?"
  - [Ask Your Own] input field with Analyze button
  - View last 3 insights (small cards)
  - Export insights CTA
- **Right Panel**: 
  - AI-generated insights and recommendations
  - Quick action buttons

**Features Demonstrated**:
- Real-time financial metrics display
- Conversational AI interface
- Personalized financial insights
- Quick access to common financial queries
- Export functionality for reports

### 2. `query-input.html` - Query Input / Agent Screen
**Purpose**: Collect user input and initiate Gemini prompt

**Key Components**:
- **Text Input**: "What's my SIP performance this year?"
- **Dropdown**: Insight Type (Projection, Investment Suggestion, Goal Plan)
- **"Analyze" Button**
- **Visual loader**: "Processing your financial data..."
- **Example Questions**: Help users understand what they can ask
- **Powered by Google Cloud + Vertex AI** badge

**Features Demonstrated**:
- Natural language query input
- Structured insight categorization
- Loading states and user feedback
- Clear examples for user guidance

### 3. `investments.html` - Insight Output / Gemini Results View
**Purpose**: Deliver clear, data-driven feedback from Gemini analysis

**Key Components**:
- **Summary**: "Your SIPs underperformed the market by 4.5%"
- **Gemini-generated Recommendation**: "Switch ₹5000/month to HDFC Flexi Cap"
- **Chart**: "Growth vs Benchmark" (SVG or PNG)
- **Tags**: 🧠 Gemini-generated • 📊 Chart Generated • 🔒 Secure
- **Export and Follow-up Actions**

**Features Demonstrated**:
- Clear summary of analysis results
- Actionable AI recommendations
- Visual data representation
- Trust indicators and security badges

### 4. `insight-history.html` - Insight History View
**Purpose**: Show past interactions and insights for reference and re-analysis

**Key Components**:
- **Filter Options**: By type, date range, search functionality
- **History Cards**: 
  - Query: "Can I afford ₹50L home loan?"
  - Summary with key metrics
  - Timestamp and insight type
  - Re-run / Export / Compare actions
- **Metric Badges**: Visual indicators for performance metrics

**Features Demonstrated**:
- Complete interaction history
- Easy re-analysis capabilities
- Comparison tools for tracking progress
- Export options for historical data
- Interactive filtering and search

### 5. `login-onboarding.html` - Login, Onboarding, and Export Control
**Purpose**: User authentication, initial setup, and data control

**Key Components**:
- **Login Page**: Google OAuth integration and traditional login
- **Onboarding Steps**: 
  - Step 1: Fi account connection
  - Step 2: Financial goal setting
  - Step 3: Setup completion
- **Export + Control Screen**:
  - Toggle: "Allow export to Google Sheets / PDF"
  - Generated insights preview table
  - Export buttons: PDF / CSV / JSON
  - "Connect with another model" option
- **Security Features**: Bank-level security badges

**Features Demonstrated**:
- Secure authentication flow
- Fi MCP server integration setup
- User goal setting and risk profiling
- Data portability and user ownership
- Google Cloud + Vertex AI branding

### 6. `mobile-chat.html` - Mobile Chat Interface
**Purpose**: Mobile-optimized chat interface for on-the-go financial advice.

**Key Components**:
- **Mobile Header**: Compact header with key financial metrics
- **Quick Suggestions**: Pre-defined question chips
- **Chat Interface**: Mobile-optimized messaging with rich responses
- **Voice Input**: Support for voice-based queries

**Features Demonstrated**:
- Mobile-first design approach
- Touch-friendly interface
- Quick access to common questions
- Rich message formatting with charts and insights
- Voice interaction capabilities

### 4. `login-onboarding.html` - Login and Onboarding Flow
**Purpose**: User authentication and initial setup process.

**Key Components**:
- **Login Page**: Google OAuth integration and traditional login
- **Onboarding Steps**: 
  - Step 1: Fi account connection
  - Step 2: Financial goal setting
  - Step 3: Setup completion
- **Security Features**: Bank-level security badges and permission explanations

**Features Demonstrated**:
- Secure authentication flow
- Fi MCP server integration setup
- User goal setting and risk profiling
- Security and privacy transparency
- Progressive onboarding experience

## Design Principles

### 1. **AI-First Experience**
- Conversational interface is prominently featured
- AI insights are integrated throughout the application
- Natural language queries are encouraged and supported

### 2. **Data Transparency**
- Clear visualization of financial data
- Transparent permissions for Fi account access
- Real-time data synchronization indicators

### 3. **Mobile Responsive**
- Dedicated mobile interface design
- Touch-friendly interaction elements
- Optimized information hierarchy for small screens

### 4. **Security & Privacy**
- Bank-level security indicators
- Clear data access permissions
- User control over data sharing and exports

### 5. **Personalization**
- Customized insights based on user's financial profile
- Goal-based recommendations
- Adaptive interface based on user behavior

## User Flow Overview

```
1. Login/Registration
   ↓
2. Onboarding (Fi Connection + Goal Setting)
   ↓
3. Dashboard (Financial Overview + AI Chat)
   ↓
4. Detailed Views (Investments, Liabilities, etc.)
   ↓
5. AI Interactions (Questions, Scenarios, Recommendations)
   ↓
6. Export & Sharing (Reports, Insights)
```

## Technical Considerations

### 1. **Responsive Design**
- Wireframes demonstrate desktop and mobile layouts
- Grid-based layout system for consistent spacing
- Scalable components for different screen sizes

### 2. **Real-time Data**
- Live financial metrics updates
- Real-time AI response generation
- Synchronized data across devices

### 3. **Performance Optimization**
- Lazy loading for large datasets
- Efficient chart rendering
- Optimized mobile performance

### 4. **Accessibility**
- High contrast color schemes
- Screen reader friendly navigation
- Keyboard navigation support

## Color Scheme & Visual Identity

### Primary Colors
- **Primary Blue**: #007bff (Actions, Links, Primary Elements)
- **Success Green**: #28a745 (Positive metrics, Success states)
- **Warning Orange**: #ffc107 (Alerts, Warnings)
- **Danger Red**: #dc3545 (Negative metrics, Errors)

### Background Colors
- **Light Gray**: #f5f7fa (Page background)
- **White**: #ffffff (Card backgrounds)
- **Dark Gray**: #6c757d (Secondary text)

### Typography
- **Primary Font**: Arial, sans-serif
- **Headings**: Bold, 18-28px
- **Body Text**: Regular, 14-16px
- **Small Text**: 12px for labels and metadata

## Interactive Elements

### 1. **Chat Interface**
- Message bubbles with distinct user/AI styling
- Typing indicators for AI responses
- Rich content support (charts, tables, action buttons)
- Quick suggestion chips

### 2. **Navigation**
- Sidebar navigation with active states
- Breadcrumb navigation for deep pages
- Quick action buttons throughout the interface

### 3. **Data Visualization**
- Interactive charts and graphs
- Hover states for additional information
- Responsive chart sizing

### 4. **Forms & Inputs**
- Clear form validation states
- Progressive disclosure for complex forms
- Autocomplete and suggestion features

## Future Enhancements

### 1. **Advanced AI Features**
- Voice-to-text integration
- Predictive financial modeling
- Multi-language support

### 2. **Enhanced Visualizations**
- Interactive portfolio rebalancing
- Goal progress tracking
- Scenario planning tools

### 3. **Collaboration Features**
- Family financial planning
- Advisor sharing capabilities
- Team budgeting tools

### 4. **Integration Expansion**
- Additional financial institution support
- Third-party app integrations
- API access for developers

## Viewing the Wireframes

To view the wireframes:
1. Open any `.html` file in a web browser
2. Each wireframe is self-contained with inline CSS
3. Wireframes are labeled and annotated for clarity
4. Interactive elements are styled to show hover/active states

## Implementation Notes

These wireframes serve as a blueprint for the React frontend implementation. Key considerations for development:

1. **Component Structure**: Each wireframe section can be implemented as reusable React components
2. **State Management**: Consider Redux or Context API for managing financial data and AI conversation state
3. **API Integration**: Components should be designed to easily integrate with the backend API endpoints
4. **Testing**: Wireframes provide clear user scenarios for automated testing
5. **Performance**: Large datasets (transactions, holdings) should implement virtual scrolling or pagination

## Feedback and Iteration

These wireframes are designed to be iterative. Key areas for potential refinement:
- User testing feedback on AI conversation flow
- Performance optimization for mobile devices
- Accessibility improvements based on user needs
- Integration feedback from Fi MCP server testing
