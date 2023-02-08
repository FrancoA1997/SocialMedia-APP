const router = require("express").Router();
const User = require("../models/user");


///REGISTER
router.post("/register", (req, res) =>{
    const user = new User({
        username: "John",
        email: "joh"
    })
})
module.exports = router;