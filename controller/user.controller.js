import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const UserController = {
    
    UserLoginToken: async(userName,password) => {
        if (!userName) {
            throw { code: 400, message: 'Invalid userName' };
          }
          if (!password) {
            throw { code: 400, message: 'Invalid password' };
          }
          const existingUser = await User.findOne({ userName: userName });
         
          if (!existingUser) {
            throw { code: 400, message: 'Invalid userName or Password' };
          }
          const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        
          if (!isPasswordValid) {
            throw { code: 401, message: 'Invalid userName or Password' };
          }
          const accessTokenResponse = {
            id: existingUser._id,
            userName: existingUser.userName,
          };
          const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d',
          });
          return {
            userName: existingUser.userName,
            accessToken: accessToken,
          };
        },
}