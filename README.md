# Fiscal Flow

<p align="center">
  <img src="public/images/fiscal-flow-banner.png" alt="Fiscal Flow Banner">
</p>

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-Latest-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  
</div>

## 🌟 Overview

**Fiscal Flow** is a modern, open-source personal finance management application built with Next.js, TypeScript, and Prisma. It empowers users to take control of their financial lives with intuitive expense tracking, budget management, and AI-powered insights.

**Fiscal Flow** is a modern, open-source personal finance management application built with Next.js, TypeScript, and Prisma. It empowers users to take control of their financial lives with intuitive expense tracking, budget management, and AI-powered insights.

<div align="center">
  <h3>📊 Application Screenshots</h3>
</div>

<table>
  <tr>
    <td width="50%">
      <img src="./public/images/dashboard-screenshot.png" alt="Dashboard" width="100%"><br/>
      <p align="center"><b>Comprehensive Dashboard</b></p>
    </td>
    <td width="50%">
      <img src="./public/images/budgeting-screenshot.png" alt="Budgeting" width="100%"><br/>
      <p align="center"><b>Budget Planning & Tracking</b></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="./public/images/analytics-screenshot.png" alt="Analytics" width="100%"><br/>
      <p align="center"><b>In-depth Financial Analytics</b></p>
    </td>
    <td width="50%">
      <img src="./public/images/freelance-screenshot.png" alt="Freelance Tools" width="100%"><br/>
      <p align="center"><b>Freelancer Income Tracking</b></p>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <img src="./public/images/ai-screenshot.png" alt="AI Assistant" width="100%"><br/>
      <p align="center"><b>AI-Powered Financial Assistant</b></p>
    </td>
  </tr>
</table>

## ✨ Features

### Core Functionality
- **Dashboard** - Centralized view of your financial health
- **Expense Tracking** - Monitor and categorize all expenditures
- **Income Management** - Track multiple income sources
- **Account Management** - Support for bank accounts, cash, and fixed deposits
- **Budget Planning** - Set and monitor budgets with visual feedback
- **Zero-Based Budgeting** - Allocate every dollar to a specific purpose

### Advanced Features
- **AI-Powered Financial Assistant** - Ask questions about your finances and get intelligent answers
- **What-If Scenarios** - Simulate financial decisions and see the long-term impact
- **Merchant Analytics** - Understand spending patterns across different merchants
- **Predictive Cash Flow** - View projections based on recurring transactions
- **Financial Health Score** - Get a quantitative measure of your overall financial health
- **Debt Management** - Track and optimize debt payoff strategies
- **Financial Goals** - Set and track progress toward savings targets

### Freelancer Tools
- **Freelance Income Tracking** - Monitor earnings across multiple platforms
- **Client Profitability Analysis** - See which clients provide the best returns
- **Platform Income Analysis** - Compare income across different freelance platforms
- **Time Tracking** - Track hours worked and calculate effective hourly rates

### Technical Features
- **Dark Mode Support** - Seamless light/dark theme switching
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Offline Support** - Core functionality works without an internet connection
- **Data Visualization** - Beautiful charts and graphs for better insights
- **Real-time Updates** - See changes immediately as you make them
- **Data Export** - Export your financial data for external analysis

## 📋 Prerequisites

Before setting up Fiscal Flow, ensure you have:

- Node.js 16.x or later
- PostgreSQL 13 or later (or alternative supported by Prisma)
- npm or yarn
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/WWI2196/fiscal-flow.git
cd fiscal-flow
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fiscal_flow"

# For AI features (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-api-key"
```

### 4. Database Setup

Initialize and seed your database:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database with example data
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:9002` in your browser to see the application.

## 🗄️ Database Schema

Fiscal Flow uses Prisma with PostgreSQL (by default). Here's an overview of the main data models:

- **Account**: Bank accounts, cash, fixed deposits
- **Expense**: All expenditures with categories
- **Income**: Revenue streams
- **FreelanceIncome**: Specialized income tracking for freelancers
- **Debt**: Loans and other debt instruments
- **FinancialGoal**: Savings targets
- **RecurringTransaction**: Scheduled regular payments and income
- **BudgetAllocation**: Budget categories and limits

For complete schema details, see `prisma/schema.prisma`.

## 🔧 Configuration

### AI Assistant Configuration

The AI financial assistant requires a Google Gemini API key:

1. Obtain an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the key to your `.env` file as `GOOGLE_GENAI_API_KEY`

### Styling and Theming

Fiscal Flow uses Tailwind CSS for styling. The main theme configuration is in `tailwind.config.ts`.

## 📱 Mobile Experience

Fiscal Flow is fully responsive and works well on mobile devices. For the best experience, you can:

- Add to Home Screen on iOS/Android for a native app-like experience
- Configure push notifications (if enabled)

## 🤝 Contributing

Contributions are welcome! Please check out our [contribution guidelines](CONTRIBUTING.md) for more information.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

Fiscal Flow is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Prisma](https://www.prisma.io/) for the database ORM
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Recharts](https://recharts.org/) for data visualization
- [Google AI Gemini](https://ai.google.dev/) for AI assistant functionality
- [Framer Motion](https://www.framer.com/motion/) for animations
- [GSAP](https://greensock.com/gsap/) for advanced animations

## 📞 Support

For issues and features, please [open an issue](https://github.com/WWI2196/fiscal-flow/issues) on GitHub.

---

<p align="center">
  <sub>Made with ❤️ for better financial management</sub>
</p>
