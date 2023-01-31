const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./authRouter');
const cors = require('cors');
const cookieParser = require("cookie-parser");
require("dotenv").config();


const PORT = process.env.PORT || 5000;

const app = express(); 

app.use(express.json());

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
  }));

app.use(cookieParser());

app.use("/auth", authRouter);

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        app.listen(PORT);
    } catch (error) {
        console.log(error);
    }
}

start();