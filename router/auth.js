import route  from 'express';
import authController from '../controller/auth.js';
import {body} from 'express-validator';
import User from '../models/user.js';
const router = route.Router();

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter valid email')
    .custom((value,{req})=>{
      return User.findOne({email : value})
      .then(userDocs => {
          if(userDocs){
              return Promise.reject('Email exist Already, please pick different one');
          }
      });
    }),
    body('password','please enter a password Only Alphanumeric and atleast 5 character')
    .trim().isLength({min : 5}),
    body('name').trim().not().isEmpty()
   
],authController.signup);

router.post('/login',authController.login);


export default router;