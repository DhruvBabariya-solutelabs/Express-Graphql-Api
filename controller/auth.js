import User from '../models/user.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const signup = async (req,res,next)=>{
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const error = validationResult(req);
    if(!error.isEmpty()){
        const err = new Error('validation Faild');
        err.statusCode = 422;
        err.data = error.array();
        throw err;
    }
    try{
        const hasPassword = await bcrypt.hash(password.trim(),12);
        console.log(hasPassword);
        const user = new User({
            email : email,
            password : hasPassword,
            name : name
        });
        const result = await user.save();
        console.log('user is save');
        return res.status(201).json({message: 'user created', userId : result._id});
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const login = async (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({email : email});
        console.log(user);
        if(!user){
            const err = new Error('A user with this email is not found');
            err.statusCode = 401;
            throw err;
        }
        const isEqual = await bcrypt.compare(password,user.password.trim());
        console.log(isEqual);
        if(!isEqual){
            const err = new Error('Wrong Password');
            err.statusCode = 401;
            throw err;
        }
        const token = jwt.sign({
            email : user.email,
            userId : user._id.toString()
        },'somesecretsecretsecret',{expiresIn:'1h'});

        res.status(200).json({
            token :token,
            userId : user._id.toString()
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}


export default {signup,login}