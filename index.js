const conversationRoute = require('./routes/conversation');
const messagesRoute = require('./routes/messages');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const authRoute = require('./routes/auth');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require("path");
const app = express();


dotenv.config();
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL, () =>{
    console.log("Connected to MongoDB")
});
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename:(req, file, cb ) => {
        cb(null, req.body.name1 )
    },
});

const upload = multer({storage: storage});
app.post('/api/upload', upload.single("file"), (req, res) =>{
    try{
        return res.status(200).json("file uploaded successfully")
    }catch(err){
        console.log(err)
    }
})
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/message", messagesRoute);


app.listen(8800, () =>{
    console.log("Backend server is running")
});
