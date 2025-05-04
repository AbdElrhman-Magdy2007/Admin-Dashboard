Admin Dashboard
A modern, responsive, and feature-rich Admin Dashboard built with React, TypeScript, and Tailwind CSS. This project provides a comprehensive interface for managing customers, orders, and analytics, with a focus on usability, performance, and scalability.
Table of Contents

Features
Technologies
Installation
Usage
Project Structure
Contributing
License

Features

Customer Dashboard: Manage customer information with search, filter, sort, and bulk actions (export/delete). Fully responsive for mobile, tablet, and desktop screens.
Responsive Design: Optimized layouts for all screen sizes using Tailwind CSS.
Interactive UI: Includes pagination, loading states, and toast notifications for user actions.
Type Safety: Built with TypeScript for robust type checking and maintainability.
Mock Data: Uses mock customer data for development and testing purposes.
Accessibility: Follows best practices for ARIA labels and keyboard navigation.

Technologies

React: Frontend library for building user interfaces.
TypeScript: Adds static types to JavaScript for better tooling and reliability.
Tailwind CSS: Utility-first CSS framework for rapid and responsive styling.
Shadcn/UI: Reusable UI components for a consistent design system.
Lucide Icons: Lightweight and customizable icon library.
Vite: Fast build tool and development server.
Lodash: Utility library for debouncing and other helpers.
Sonner: Toast notification library for user feedback.
Date-fns: Modern date utility library for formatting.

Installation

Clone the repository:
git clone https://github.com/AbdElrhman-Magdy2007/polished-panel-craft.git
cd polished-panel-craft


Install dependencies:
npm install


Set up environment variables (if applicable):Create a .env file in the root directory and add any required environment variables (e.g., API keys).

Run the development server:
npm run dev

Open http://localhost:5173 in your browser to view the application.


Usage

Customer Dashboard: Navigate to the /customers route to view and manage customer data.
Search: Use the search bar to find customers by name or email.
Filter: Filter customers by status (All, Active, Inactive).
Sort: Sort columns (Name, Email, Joined, Orders, Spent) in ascending or descending order.
Bulk Actions: Select multiple customers to export as CSV or delete.
Responsive Views: Card view on mobile, table view on tablet/desktop.


Toast Notifications: Feedback for actions like viewing, editing, or deleting customers.
Pagination: Navigate through customer lists with responsive pagination controls.

Project Structure
polished-panel-craft/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── dashboard-layout.tsx
│   │   ├── ui/
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── input.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   ├── data/
│   │   ├── mockData.ts
│   │   └── types.ts
│   ├── hooks/
│   │   └── use-mobile.ts
│   └── pages/
│       └── Customers.tsx
├── public/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore


src/components/: Reusable UI components and layouts.
src/data/: Mock data and TypeScript type definitions.
src/hooks/: Custom React hooks (e.g., device type detection).
src/pages/: Page components like the Customer Dashboard.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

License
This project is licensed under the MIT License. See the LICENSE file for details.
