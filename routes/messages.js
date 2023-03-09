const router = require("express").Router();
const Message = require('../models/Message.js');
const jwt = require('jsonwebtoken')

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "mySecretKey", (err, payload)=> {
            if(err){
                return res.status(403).json("Invalid token")
            }
            req.payload = payload;
            next();
        });
    }else{
        res.status(401).json("You are not authenticated")
    }

}
//Add messages
router.post("/",verify, async (req, res) => {
    const newMessage = new Message(req.body)
    try{

        const saveMessage = await newMessage.save()
        res.status(200).json(saveMessage)
    }catch(err){
        res.status(500).json(err)
    }
})
//Get messages
router.get("/:conversationId", verify, async (req, res) => {
    try{

        const messages = await Message.find({
            conversationId: req.params.conversationId,
        });

        res.status(200).json(messages)
    }catch(err){
        res.status(500).json(err)
    }
})

module.exports = router;

