const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes'); // Add this line
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Routes
app.use('/api', userRoutes);
app.use('/auth', authRoutes); // Add this line

app.get('/', (req, res) => {
    res.send('Welcome to the HackNuThon API!');
});

module.exports = app;