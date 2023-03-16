const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
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
let refreshedTokens= [];

router.post("/refresh", (req,res) =>{
    //Take the refresh token from user
    const refreshToken = req.body.token;
    //Send error if there is no token or it's invalid
    if(!refreshToken) return res.status(401).json("You are not authenticated!")
    //if everything is ok, create new access token, refresh token and send to the user
    if(!refreshedTokens.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid")
    }
    jwt.verify(refreshToken, "mySecretRefreshKey", (err, payload) => {
        err && console.log(err);
        refreshedTokens = refreshedTokens.filter(token => token !== refreshToken);
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);
        refreshedTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })
    })
})

///REGISTER
router.post("/register", async (req, res) =>{
  
    try{
        //Generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //Create new user
        const newUser = new User({
            username:req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        //Save user and response
        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err)
    }

    });
    ///Generate JWT token
    const generateAccessToken = (user) => {
     return  jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        }, 
            "mySecretKey",
        { 
                expiresIn: "30m"
        });
      
    }
    const generateRefreshToken = (user) => {
     return   jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin,
        },
             "mySecretRefreshKey",
            
             );
      
    }

    //LOGIN
    router.post("/login", async (req, res) =>{
        try{
            const user = await User.findOne({email:req.body.email, });
            !user && res.status(404).json("User not found!")
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            !validPassword && res.status(400).json("Wroong password")
            if(user){
             const accessToken = generateAccessToken(user);

            const refreshToken = generateRefreshToken(user);
            refreshedTokens.push(refreshToken);
                res.status(200).json({
                   username: user.username,
                   following: user.following,
                   description: user.description,
                   email: user.email,
                   _id: user._id,
                   profilePicture: user.profilePicture,
                   coverPicture: user.coverPicture,
                   isAdmin: user.isAdmin,
                   relationship:user.relationship,
                   city: user.city,
                   from: user.from,
                   accessToken,
                   refreshToken,
                });
            }
        }catch(err){
            res.status(500).json(err)
        }  
    })
    //LOGOUT
    router.post("/logout", verify,(req,res) => {
        const refreshToken = req.body.token;
        refreshedTokens = refreshedTokens.filter((token) => token !== refreshToken)
        res.status(200).json("You logged out successfully")
    } )
  
   
   
 

module.exports = router;