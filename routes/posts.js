const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
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

//create a post 
router.post("/", verify, async (req, res) => {
const newPost = new Post(req.body);
try{
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
}catch(err){
    res.status(500).json(err);
}
});

//update a post
router.put("/:id" , verify, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);
        
        if(post.userId === req.body.userId){
            console.log(post.userId)
            await post.updateOne({
                $set:req.body
            });
            res.status(200).json("Post has been updated")
    
        }else {
            res.status(403).json("You can update only your posts")
        }
    }catch(err){
        res.status(500).json(err)
    }
    
});
//delete a post
router.delete("/:id" , verify, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);
        
        if(post.userId === req.body.userId){
            console.log(post.userId)
            await post.deleteOne();
            res.status(200).json("Post has been deleted")
    
        }else {
            res.status(403).json("You can delete only your posts")
        }
    }catch(err){
        res.status(500).json(err)
    }
    
});
//like a post
router.put("/:id/like", verify, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({
                $push:{
                    likes:req.body.userId
                }
            });
            res.status(200).json("the post has been liked");
        }else{
            await post.updateOne({
                $pull:{
                    likes:req.body.userId
                }
            });
        res.status(200).json("the post has been disliked")
        }

    }catch(err){
        res.status(500).json(err);
    }

})
//get a post

router.get("/:id" , verify, async (req, res) =>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post)
    }catch(err){
        res.status(500).json(err);
    }
})
//get timeline posts
router.get("/timeline/:userId", verify, async (req, res) =>{
    try{
        const currentUser = await User.findById(req.params.userId);
        console.log(currentUser);
        const userPosts = await Post.find({userId: currentUser._id});
        console.log(userPosts);
        const friendPosts = await Promise.all(
            currentUser.following.map((friendId) =>{
               return Post.find({userId: friendId});
            })
        );
        res.json(userPosts.concat(...friendPosts));
    }catch(err){
        res.status(500).json(err);
    }
})

//get all user posts
router.get("/profile/:username", verify, async (req, res) =>{
    try{
    const user = await User.findOne({username: req.params.username})
    const posts = await Post.find({userId: user._id})
       res.status(200).json(posts)
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports = router;