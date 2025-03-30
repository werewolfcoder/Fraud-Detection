const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { sequelize, connectDB } = require('./config/db'); // Update this line
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const cors = require('cors');

dotenv.config();
// Initialize database connection
connectDB()
    .then(() => console.log('Database initialized'))
    .catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });

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
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the HackNuThon API!');
});

module.exports = app;