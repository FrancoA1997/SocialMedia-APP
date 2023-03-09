const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt")
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

//UPDATE USER
router.put("/:id", verify, async (req, res) =>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt);

            }catch(err){
                return res.status(500).json(err);
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,

            });
            res.status(200).json("Accout has been updated!")
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(400).json("You can update only your account!")
    }

});
//DELETE USER
router.delete("/:id",verify, async (req, res) =>{
    if(req.body.userId == req.params.id || req.body.isAdmin){
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Accout has been deleted successfully!")
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(400).json("You can delete only your account!")
    }
});
//GET A USER
router.get("/",verify, async(req, res) =>{
    const userId = req.query.userId;
    const username = req.query.username;
    try{
        const user = userId 
        ? await User.findById(userId)
        : await User.findOne({username : username})
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other);
    }catch(err){
        res.status(500).json(err);
    }
});

//GET FOLLOWED USERS
router.get("/friends/:userId",verify, async(req, res) =>{
try{
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
        user.following.map(friendId => {
            return User.findById(friendId)
        })
    )
    let friendList = [];
    friends.map(friend => {
        const {_id, username, profilePicture} = friend;
        friendList.push({_id, username, profilePicture});
    });
    res.status(200).json(friendList)
}catch(err){
    res.status(500).json(err);
}


})
//FOLLOW A USER
router.put("/:id/follow", verify, async(req, res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $push:{
                        followers: req.body.userId
                    }
                })
                await currentUser.updateOne({
                    $push:{
                        following: req.params.id
                    }
                })
                res.status(200).json("User has been followed!")
            }else{
                res.status(403).json("You already follow this user")
            }
        }catch(err){
            res.status(500).json("cant find user")
        }
    }else{
        res.status(405).json("You can't follow yourself")
    }
})
//UNFOLLOW A USER
router.put("/:id/unfollow", verify, async(req, res) =>{
    if(req.body.userId !== req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({
                    $pull:{
                        followers: req.body.userId
                    }
                })
                await currentUser.updateOne({
                    $pull:{
                        following: req.params.id
                    }
                })
                res.status(200).json("User has been unfollowed!")
            }else{
                res.status(403).json("You don't follow this user")
            }
        }catch(err){
            res.status(500).json("cant find user")
        }
    }else{
        res.status(405).json("You can't unfollow yourself")
    }
})
module.exports = router;