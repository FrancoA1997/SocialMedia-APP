const router = require("express").Router();
const Conversation = require('../models/Conversation.js')
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
//Create new conversation
router.post("/", verify, async (req, res)=>{
    const newConversation = new Conversation({
        members:[req.body.senderId, req.body.receiverId]
    });
    try{
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    }catch(err){
        res.status(500).json(err);
    }
});
//Get conversation of user
router.get("/:userId", verify, async (req, res) => {
    try{
        const conversation = await Conversation.find({
            members:{ $in:[req.params.userId]}
        });
        res.status(200).json(conversation);
    }catch(err){
        res.status(500).json(err);
    }
});


// Get conversations including two users id
router.get("/find/:firstUserId/:secondUserId", verify, async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members:{ $all:[req.params.firstUserId, req.params.secondUserId]}
        })
        res.status(200).json(conversation)
    }catch(err){
        res.status(500).json(err)
    }
})
module.exports = router;