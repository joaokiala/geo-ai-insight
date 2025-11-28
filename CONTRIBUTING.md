# Contributing to Geo AI Insights

Thank you for your interest in contributing to Geo AI Insights! This document outlines the process for contributing to the project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Coding Standards](#coding-standards)
4. [Pull Request Process](#pull-request-process)
5. [Reporting Issues](#reporting-issues)

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/geo-ai-insights.git
   ```
3. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Ensure you have Node.js v18+ installed
2. Install dependencies:
   ```bash
   npm install
   cd server
   npm install
   ```
3. Create a `.env` file in the `server` directory (copy from `.env.example` if available)
4. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Coding Standards

### JavaScript/React
- Follow Airbnb JavaScript style guide
- Use functional components with hooks
- Use PropTypes for type checking
- Write JSDoc comments for functions

### CSS/Tailwind
- Use Tailwind CSS utility classes
- Create reusable components when possible

### Backend (Node.js/Express)
- Use async/await for asynchronous operations
- Handle errors appropriately
- Validate all inputs

## Pull Request Process

1. Ensure your code follows the coding standards
2. Update documentation if you've changed APIs
3. Add tests if applicable
4. Describe your changes in the PR description
5. Link any related issues
6. Request review from maintainers

## Reporting Issues

Please use the GitHub issue tracker for:
- Bug reports
- Feature requests
- Documentation improvements

When filing an issue, please include:
- A clear title and description
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, etc.)

## Code of Conduct

This project follows a code of conduct that respects all contributors. Please be professional and courteous in all interactions.