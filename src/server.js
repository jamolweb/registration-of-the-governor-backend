require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = [
    'https://qabulga-yozilish.uz',
    'https://hokimiyat-bot-frontend.vercel.app'
];

const corsOptionsDelegate = function (req, callback) {
    const corsOptions = allowedOrigins.indexOf(req.header('Origin')) !== -1 ? { origin: true } : { origin: false };
    callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(bodyParser.json());

// Import routes
app.use('/requests', require('./routes/request'));
app.use('/done-requests', require('./routes/doneRequest.js'));
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});