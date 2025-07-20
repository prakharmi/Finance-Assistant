# 💸 SpendSenseAI - The Intelligent Personal Finance Assistant

SpendSenseAI is a modern, full-stack web application that helps users **track, manage, and analyze** their financial activities. Powered by **Google's Gemini AI**, the app automates data extraction from receipts and PDF bank statements, delivering seamless insights into spending habits with minimal manual input.

> 🚀 Built as a comprehensive solution to a Software Engineer Project Assignment at FaceTpe India, it fulfills all core and bonus requirements with a robust, scalable, and user-centric design.

---

## 🎥 Demo Video

> _[I'll insert it here]_  
> 

---

## ✨ Features

### ✅ Core Features

- **Manual Transaction Entry** — Add income and expenses through a clean, user-friendly form.
- **Comprehensive Dashboard** — Paginated list of transactions with rich filtering.
- **Dynamic Filtering** — Filter by type (income/expense), category, or custom date ranges.
- **Data Visualization**  
  - Doughnut chart: Expenses by Category  
  - Bar chart: Monthly Income vs. Expenses  
  - Line chart: Category-wise Spending Trends
- **Multi-User Support** — Secure Google OAuth 2.0 login and private data access.

### 🤖 AI-Powered & Bonus Features

- **AI Receipt Scanning** — Upload an image of a receipt and let Gemini extract details.
- **AI PDF Import** — Upload tabular PDF bank statements for automatic parsing.
- **Full CRUD Support** — Create, Read, Update (modal-based), and Delete transactions.
- **Pagination Controls** — Customize items per page for smooth navigation.
- **Modern Responsive UI** — Built with Tailwind CSS and a dark mode toggle.

---

## 🛠️ Technology Stack

| Area         | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| **Frontend** | HTML5, CSS3, JavaScript , Tailwind CSS                     |
| **Backend**  | Node.js, Express.js                                                       |
| **Database** | MongoDB with Mongoose ODM                                                 |
| **Auth**     | Passport.js with Google OAuth 2.0, express-session                        |
| **AI / ML**  | Google Gemini API (for receipt & PDF parsing)                             |
| **File Uploads** | Multer (server-side file handling)                                   |

---

## ⚙️ Local Setup & Installation

### 🔧 Prerequisites

- [Node.js](https://nodejs.org) (v18.x or higher)
- npm (comes with Node.js)
- Local MongoDB instance running

### 🧩 1. Clone the Repository

```bash
git clone https://github.com/your-username/SpendSenseAI.git
cd SpendSenseAI
```

### 📦 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 🔐 3. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
DATABASE_URL=mongodb://127.0.0.1:27017/spendsenseai

# Session Secret
SESSION_SECRET=a_very_long_and_random_secret_string_123

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Google Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Frontend Base URL
CLIENT_URL=http://localhost:8080
```

### 🌐 4. Google OAuth Setup

Go to [Google Cloud Console](https://console.cloud.google.com)

- Navigate to: **APIs & Services > Credentials**
- Add this to the **Authorized Redirect URIs**:

```text
http://localhost:8080/auth/google/callback
```

### ▶️ 5. Run the App

```bash
node server.js
```

Open your browser at:  
[http://localhost:8080](http://localhost:8080)

---

## 📁 Project Structure

```plaintext
SpendSenseAI/
├── backend/
│   ├── config/         # Google OAuth, Passport strategies
│   ├── middleware/     # Custom middleware (auth checks, etc.)
│   ├── models/         # Mongoose models (User, Transaction, etc.)
│   ├── routes/         # API route handlers (auth, transactions)
│   ├── .env            # Environment config (not committed)
│   └── server.js       # Entry point for Express backend
│
└── frontend/
    ├── analytics/      # Analytics dashboard (HTML, CSS, JS)
    ├── dashboard/      # Transactions dashboard (HTML, CSS, JS)
    ├── index.html      # Landing/Login page
    └── script.js       # Global scripts (dark mode, etc.)
```

---

## 📌 Future Improvements

- Export reports as CSV/Excel

---

## 🤝 Contributing

Pull requests are welcome! If you’d like to propose a feature or fix a bug, feel free to fork the repo and open a PR.

---

## 📄 Created by Prakhar Mishra
