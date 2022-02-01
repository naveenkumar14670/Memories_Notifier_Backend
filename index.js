const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./Routes/userRouter');
const memoryGroupRouter = require('./Routes/memoryGroupRouter');
const cardRouter = require('./Routes/cardRouter');
const emailSeriveRouter = require('./Routes/EmailServiceRouter');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

app.use('/user', userRouter);
app.use('/memoryGroup', memoryGroupRouter);
app.use('/card', cardRouter);
app.use('/sendEmails', emailSeriveRouter);

app.get('/', (req, res) => {
    res.send('hello');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log("server running on port - 5000");
});

mongoose.connect(process.env.DB_URI, () => {
    console.log("Database connected successfully");
});