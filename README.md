SpendSenseAI - The Intelligent Personal Finance Assistant
SpendSenseAI is a modern, full-stack web application designed to provide users with an intuitive and powerful platform for tracking, managing, and analyzing their financial activities. By leveraging the power of Google's Gemini AI, SpendSenseAI automates the tedious task of data entry from receipts and bank statements, allowing users to gain effortless insights into their spending habits.

This project was developed as a comprehensive solution to the Software Engineer Project Assignment of FaceType India, fulfilling all core requirements and implementing all bonus features to showcase a robust, scalable, and user-centric application.

🎥 Project Demonstration
Below is a short video demonstrating the core features of SpendSenseAI, from manual transaction entry and data visualization to the AI-powered receipt and PDF import functionalities.

(i'll add it here)

✨ Features
SpendSenseAI is packed with features designed to make personal finance management seamless and insightful.

Core Features
✅ Manual Transaction Entry: A clean, user-friendly form to add income and expenses manually.

✅ Comprehensive Dashboard: View a paginated list of all transactions with filtering capabilities.

✅ Dynamic Filtering: Filter transactions by type (income/expense), category, and date range (Past Week, Month, etc.).

✅ Data Visualization: An dedicated analytics page with interactive charts to visualize:

Expenses by Category (Doughnut Chart)

Monthly Income vs. Expense Summary (Bar Chart)

Spending Trends for Specific Categories (Line Chart)

✅ Multi-User Support: Secure user authentication via Google OAuth 2.0 ensures that each user's financial data is private and accessible only to them.

🚀 AI-Powered & Bonus Features
⭐ AI Receipt Scanning: Upload an image of a receipt, and Google's Gemini AI will automatically extract the amount, date, and category, presenting it for user confirmation before adding.

⭐ AI PDF Statement Import: Upload a PDF bank statement in a tabular format. The application uses Gemini to intelligently parse all transactions, allowing the user to review, edit, or discard entries before bulk-importing them.

⭐ Full Pagination: The transaction list is fully paginated, with user controls to change the number of items displayed per page for a smooth browsing experience.

⭐ CRUD Functionality: Users have full control over their data with the ability to Create, Read, Update (via modals), and Delete transactions.

⭐ Responsive & Modern UI: A sleek, responsive user interface built with Tailwind CSS, featuring a dark mode toggle for user comfort.

🛠️ Technology Stack
This project utilizes a modern, robust technology stack to ensure a scalable and maintainable application.

Area

Technology

Frontend

HTML5, CSS3, JavaScript, Tailwind CSS, Chart.js

Backend

Node.js, Express.js

Database

MongoDB with Mongoose ODM

Authentication

Passport.js with Google OAuth 2.0 Strategy, express-session

AI & ML

Google Gemini API (for receipt and PDF data extraction)

File Handling

Multer (for handling file uploads on the server)

⚙️ Local Setup and Installation
To run SpendSenseAI on your local machine, please follow these steps:

Prerequisites
Node.js (v18.x or higher)

npm (Node Package Manager)

A local instance of MongoDB running on your machine.

1. Clone the Repository
git clone https://github.com/your-username/SpendSenseAI.git
cd SpendSenseAI

2. Install Backend Dependencies
Navigate to the backend directory and install the required npm packages.

cd backend
npm install

3. Set Up Environment Variables
Create a .env file in the /backend directory and add the following variables. Replace the placeholder values with your actual credentials.

# MongoDB Database Connection String (for local database)
DATABASE_URL=mongodb://127.0.0.1:27017/spendsenseai

# Session Secret for express-session
SESSION_SECRET=a_very_long_and_random_secret_string

# Google OAuth Credentials from Google Cloud Console
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Google Gemini API Key from Google AI Studio
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# The base URL of your frontend for local testing
CLIENT_URL=http://localhost:8080

4. Configure Google OAuth Redirect URI
For local testing, ensure your Google Cloud Console is configured correctly:

Go to your project's "APIs & Services" > "Credentials".

Select your OAuth 2.0 Client ID.

Add http://localhost:8080/auth/google/callback to the list of Authorized redirect URIs.

5. Run the Application
The Express server is configured to serve both the backend API and the frontend static files.

Start the backend server from the /backend directory:

node server.js

You should see a confirmation that the server is running on port 8080.

Open your web browser and navigate to http://localhost:8080.

📁 Project Structure
The project is organized into distinct frontend and backend directories to maintain a clear separation of concerns, a core principle of modular design.

SpendSenseAI/
├── backend/
│   ├── config/         # Passport.js authentication strategies
│   ├── middleware/     # Custom middleware (e.g., auth checks)
│   ├── models/         # Mongoose data models (User, Transaction, Category)
│   ├── routes/         # API route definitions (auth, transactions, analytics)
│   ├── .env            # Environment variables (local)
│   └── server.js       # Main Express server setup
│
└── frontend/
    ├── analytics/      # Analytics page (HTML, CSS, JS)
    ├── dashboard/      # Dashboard page (HTML, CSS, JS)
    ├── index.html      # Landing/Login page
    └── script.js       # Global scripts (e.g., dark mode)
