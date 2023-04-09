import cleanImage from './util/file.js';

import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import feedRoute from './router/feed.js';
import authRoute from './router/auth.js'; 
import cors from 'cors';
import {graphqlHTTP} from 'express-graphql';
import auth from './middleware/auth.js';
import graphqlSchema from './graphql/Schema.js';
import graphqlResolver from './graphql/Resolvers.js';
const app = express();

app.use(cors());
dotenv.config();

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images');
    },
    filename : (req,file,cb)=>{
        const currentDate = new Date().toISOString().slice(0,10);
        cb(null, currentDate +'-'+file.originalname);
    }

})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' ||
       file.mimetype === 'image/jpg' ||
       file.mimetype === 'image/jpeg'
    ) {
        cb(null,true);
      }else{
        cb(null,false);
      }
}

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter : fileFilter}).single('image'));
app.use('/images',express.static(path.join(path.dirname(process.cwd()),'express-restwebApp','images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', ['Content-type', 'Authorization']); // set multiple headers as an array
    if(res.method === 'OPTIONS'){
        return res.sendStatus(200);
    }
    next();
  });
  app.use(auth);
  app.put('/post-image',(req,res,next)=>{
    if(!req.isAuth){
      throw new Error("not authanticated");
    }
    if(!req.file){
      return res.status(200).json({
        message : 'No file Provided'
      });
    }
    if(req.body.oldPath){
      cleanImage(req.body.oldPath);

    }
    return res.status(201).json({
      message : 'File Store..',
      filePath : req.file.path
    })
  });

  

  app.use('/graphql', graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
        console.log(err);
      const { message, extensions } = err;
      const code = extensions?.code || 500;
      const data = extensions?.data;
      console.log(`Error: ${message}, code: ${code}, data: ${JSON.stringify(data)}`);
      return { message, code, data };
    }
  }));

app.use((err,req,res,next)=>{
    console.log("come error handling middleware");
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status).json({
        message : message,
        data : data
    })
})

mongoose.connect(process.env.MONGODB_URI)
.then(result =>{
     app.listen(8080,()=>{
        console.log("server started");
    });
})
.catch(err => console.log(err));
 
