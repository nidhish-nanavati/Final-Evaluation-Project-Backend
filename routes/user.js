const express = require('express');
const router = express.Router();
const User = require("../schema/user.schema");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userSchema = require('../schema/user.schema');

dotenv.config();


router.get('/',async (req,res)=>{
    try {
        const users = await User.find();
        res.status(200).send(users);
    }
    catch(err){
        res.status({message: err});
    }
})

router.post('/register',async (req,res)=>{
    
    const {username,email,password} = req.body;
    const isUserExist = await User.findOne({email});
    if(isUserExist){
        return res.status(400).json({message:"User already exists"});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    try{
        const user = await User.create({
            username : username,
            email : email,
            password: hashedPassword,
        });
        res.status(200).json({message:"User created"});
    }
    catch(err){
        res.status(500).json({message: err});
    }
})

router.post('/login',async (req,res) => {
    const { email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message :'Wrong username'});
    }
    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect){
        return res.status(400).json({message :'Wrong credentials'});
    }

    const payload = {
        id : user._id,
    }

    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn : "1h",
    });
    res.status(200).json({message : "User logged in succesfully" , token : token});

});

module.exports = router