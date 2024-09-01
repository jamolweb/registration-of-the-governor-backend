---

# Backend and Bot Project

This project combines an Express.js backend server with a Telegram bot. The server handles API requests, while the bot interacts with users on Telegram. The application uses Prisma ORM for database interactions and supports secure user data handling through environment variables.

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project])
- [Project Structure](#project-structure)
- [Bot Functionality](#bot-functionality)
- [API Endpoints](#https://jamolweb.github.io/abacus-api-routes/)

## Installation

To get started with this project, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/backend-and-bot.git
    cd backend-and-bot
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up the environment variables**:
    Create a `.env` file in the root directory and add the following environment variables:
    ```bash
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
    TOKEN_SECRET="token_secret"
    PORT=8080
    ```

4. **Initialize Prisma**:
    ```bash
    npx prisma migrate dev --name init
    ```

## Environment Variables

The project requires the following environment variables:

- `DATABASE_URL`: Connection string for your PostgreSQL database.
- `TELEGRAM_BOT_TOKEN`: Token for your Telegram bot.
- `TOKEN_SECRET`: Secret key for JWT token generation.
- `PORT`: Port number for the server to run on.

## Running the Project

You can run both the backend server and the Telegram bot simultaneously using the following command:

```bash
npm run dev
```

This command uses `concurrently` to start both `server.js` and `bot.js` with `nodemon`, allowing for hot-reloading during development.

## Project Structure

```
backend-and-bot/
│
├── src/
│   ├── server.js          # Main server file
│   ├── bot.js             # Telegram bot logic
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   ├── request.js     # Request handling routes
│   │   └── doneRequest.js # Done requests handling routes
│   └── prisma/            # Prisma schema and migrations
│
├── .env                   # Environment variables
├── .gitignore             # Files and directories to ignore in Git
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## Bot Functionality

The Telegram bot performs the following tasks:

1. **Start Command**:
    - When a user sends `/start`, the bot begins a series of questions to gather the user's first name, last name, and the subject of their request.

2. **Request Handling**:
    - The bot gathers user input and stores it in a PostgreSQL database using Prisma.
    - Users are informed about the success of their submission and their queue number.

3. **Day Restrictions**:
    - The bot only operates on Thursdays, Fridays, and Saturdays.

## API Endpoints

The backend server exposes the following endpoints:

- **/requests**: Handles incoming requests from users.
- **/done-requests**: Manages requests that have been completed.
- **/auth**: Manages authentication.

## License

This project is licensed under the ISC License. See the LICENSE file for more details.

---