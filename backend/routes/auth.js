const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "abhinahito$kabhinhi";

//Route 1: create a user using :POST "/api/auth/createuser" No login reqyired
router.post(
  "/createuser",
  [
    body("name", "Enter a vaild Name").isLength({ min: 3 }).escape(),
    body("email", "Enter a vaild Email").isEmail().escape(),
    body("password", "Password must be atleast 5 characters").isLength({ min: 5 }).escape(),
  ],
  async (req, res) => {
    let success=false

    //if there is errors, retuen bad erquest and error
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.send({ success,errors: result.array() });
    }
    //Check whether the user with same email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({success, error: "Sorry! a user  already exists with this email is" });
      }
      //Creating a secure Password
      const salt = await bcrypt.genSalt(10); //crating a salt for password
      const secPass = await bcrypt.hash(req.body.password, salt); ///convertng in hash

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET); //jwtToken
      // .then(user=>res.json(user))
      // .catch(err=>{console.log(err)
      // res.json({error:'Please enter a unique value for email',message:err.message})
      // })
      // res.send(req.body)
      // res.json({ user });
      success=true
      res.json({ success,authtoken });
    } catch (error) {
      // console.log("Error in creating new user", error);
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

//Route 2: Authenticate a user using :POST "/api/auth/login" No login required
router.post(
  "/login",
  [
    body("email", "Enter a vaild Email").isEmail(),
    body("password", "Password Cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false
    //if there is errors, retuen bad erquest and error
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.send({ errors: result.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false
        return res
          .status(400)
          .json({ success, error: "Pleas try to login with correct credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false
        return res
          .status(400)
          .json({ success, error: "Pleas try to login with correct credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success=true
      res.json({ success, authtoken });
    } catch (error) {
      // console.log("Error in Authintcate the user", error);
      console.error(error.message);
      return res.status(500).send("Some Error! occur.");
    }
  }
);

// Route 3: Get loggedin user details :POST "/api/auth/getuser"  Login required
router.post("/getuser",fetchuser,
  async (req, res) => {
    
    try {
      userId=req.user.id;
      const user=await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.log("Error in geting user details", error);
      console.error(error.message);
      return res.status(500).send("Some Error! occur.");
    }
  });
module.exports = router;
