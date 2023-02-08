const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config();
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, {useNewParser: true}, () =>{
    console.log("Connected to MongoDB")
});

app.use(express.json());
app.use(helmet());
app.use(morgan('common'));



app.listen(8800, () =>{
    console.log("Backend server is running")
});