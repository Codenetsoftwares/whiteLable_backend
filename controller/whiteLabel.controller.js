import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { WhiteLabel } from "../models/whiteLabel.model.js";


export const WhiteLabelController = {
    
    WhiteLabelLoginToken: async(userName,password) => {
        if (!userName) {
            throw { code: 400, message: 'Invalid userName' };
          }
          if (!password) {
            throw { code: 400, message: 'Invalid password' };
          }
          const existingWhiteLabel = await WhiteLabel.findOne({ userName: userName });
         
          if (!existingWhiteLabel) {
            throw { code: 400, message: 'Invalid userName or Password' };
          }
          const isPasswordValid = await bcrypt.compare(password, existingWhiteLabel.password);
        
          if (!isPasswordValid) {
            throw { code: 401, message: 'Invalid userName or Password' };
          }
          const accessTokenResponse = {
            id: existingWhiteLabel._id,
            userName: existingWhiteLabel.userName,
          };
          const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d',
          });
          return {
            userName: existingWhiteLabel.userName,
            accessToken: accessToken,
          };
        },


    //      // create sub white Label

    // CreateSubWhiteLabel: async(data) =>
    // {
    // const existingWhitelabel = await WhiteLabel.findOne({userName: data.userName})
    // console.log(existingWhitelabel)
    // if(existingWhitelabel)
    // {
    //     throw({code:409, message:"White Label Already Exist"})
    // }
    // if(!data.userName)
    // {   
    //     throw({message:"userName Is Required" })
    // }
    // if(!data.password)
    // {
    //     throw({message:"Password Is Required"})
    // }

    // const Passwordsalt = await bcrypt.genSalt();
    // const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    // const newWhiteLabel = new WhiteLabel({
    //         userName: data.userName,
    //         password: encryptedPassword,
            
    //     });
    //     newWhiteLabel.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save WhiteLabel" };
    //     });
    // },

}