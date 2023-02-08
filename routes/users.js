const router = require("express").Router();
router.get("/", (req, res) =>{
    res.send("Hey is user route")
})
module.exports = router;