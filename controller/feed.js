import { validationResult } from "express-validator";
import Post from "../models/postmodel.js";
import fs from 'fs';

import User from '../models/user.js';

const getPosts = async (req,res,next)=>{
    const currentPage = req.query.page || 1;
    const perPage =2;
    try{
        let totalItems= await Post.find().countDocuments()
        const posts =  await Post.find().populate('creator').sort({createdAt: -1})
                        .skip((currentPage - 1)*perPage)
                        .limit(perPage);
        res.status(200).json({
        message : "All post find Successful",
        posts : posts,
        totalItems :totalItems
    })
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const createPost = async (req,res,next)=>{

    const error = validationResult(req);
    if(!error.isEmpty()){
        const error =new Error('validation Faild Enter Valid data');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error = new Error("No image provided");
        error.statusCode = 422;
        throw error;
    }
    
    const imageUrl =req.file.path
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        title : title,
        imageUrl: imageUrl,
        content : content,
        creator : req.userId
    })
    try{
        await post.save()
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();
      //  io.getIo().emit('posts',{ action : 'create', post:{...post._doc,creator : {_id:req.userId , name : user.name}}})
        res.status(201).json({
            message : "Post Created Successfully",
            post : post,
            creator : {_id : user._id,name: user.name}
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const getPostById = async (req,res,next)=>{
    const postId = req.params.postId;
    try{
        const post = await Post.findById({_id : postId})
        if(!post){
            const error = new Error("Post Not Find");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message : "Post find successful",
            post : post
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }

}

const updatePost = async (req,res,next) => {

    const postId = req.params.postId;
    const error = validationResult(req);
    if(!error.isEmpty()){
        const error =new Error('validation Faild Enter Valid data');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl = req.file.path;
    }
    if(!imageUrl){
        const error = new Error("No file Picked");
        error.statusCode = 422;
        throw error;
    }
    try{
        const post = await Post.findById(postId).populate('creator');
        if(!post){
            const error = new Error("Not found");
            error.statusCode = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.userId.toString()){
            const error =new Error("Not Authorized!");
            error.statusCode = 403;
            throw error;
        }
        // if(imageUrl !== post.imageUrl){
        //     cleanImage(post.imageUrl);
        // }
        post.title = title;
        post.content  = content;
        post.imageUrl = imageUrl;
        const result = await post.save();
        //io.getIo().emit('posts',{ action : 'update',post : result});
        res.status(200).json({
            message : 'post Updated',
            post : result
        })
    }
    catch(err){
        console.log(err);
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const cleanImage = filePath =>{
    filePath= path.join(path.join(path.dirname(process.cwd()),'express-restwebApp',filePath));
    fs.unlike(filePath,err=> console.log(err));
}

const deletePost = async (req,res,next)=>{
    const postId = req.params.postId;
    try{
        const post = await Post.findById(postId)
        if(!post){
            const error = new Error("Not found");
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId.toString()){
            const error =new Error("Not Authorized!");
            error.statusCode = 403;
            throw error;
        }
        // cleanImage(post.imageUrl);
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();
        //io.getIo().emit('posts',{action : 'delete', post:postId})
        res.status(200).json({
            message : 'Deleted Post Successful'
        })
    }
    catch(err){
         if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const getStatus = async(req,res,next)=>{
    const userId = req.userId;
    try{
        const user = await User.findById(userId);
        if(!user){
            const err = new Error('User Not Found');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            status : user.status
        })   
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

const updateStatus = async (req,res,next)=>{
    const status = req.body.status;
    const userId = req.userId;
    const error = validationResult(req);
    if(!error.isEmpty()){
        const error =new Error('validation Faild Enter Valid data');
        error.statusCode = 422;
        throw error;
    }
    try{
        const user = User.findById(userId);
        if(!user){
            const err = new Error('User Not Found');
            err.statusCode = 404;
            throw err;
        }
        user.status = status;
        await user.save();
        res.status(200).json({
            message : "User Updated Successfully"
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}
export default {getPosts,createPost,getPostById,updatePost,deletePost,getStatus,updateStatus}