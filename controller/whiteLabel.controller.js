import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

import { Admin } from "../models/admin.model.js";
// import { AdminController } from "./admin.controller.js";


export const WhiteLabelController = {
    
    // WhiteLabelLoginToken: async(userName,password) => {
    //     if (!userName) {
    //         throw { code: 400, message: 'Invalid userName' };
    //       }
    //       if (!password) {
    //         throw { code: 400, message: 'Invalid password' };
    //       }
    //       const existingWhiteLabel = await WhiteLabel.findOne({ userName: userName });
         
    //       if (!existingWhiteLabel) {
    //         throw { code: 400, message: 'Invalid userName or Password' };
    //       }
    //       const isPasswordValid = await bcrypt.compare(password, existingWhiteLabel.password);
        
    //       if (!isPasswordValid) {
    //         throw { code: 401, message: 'Invalid userName or Password' };
    //       }
    //       const accessTokenResponse = {
    //         id: existingWhiteLabel._id,
    //         userName: existingWhiteLabel.userName,
    //       };
    //       const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
    //         expiresIn: '1d',
    //       });
    //       return {
    //         userName: existingWhiteLabel.userName,
    //         accessToken: accessToken,
    //       };
    //     },


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

    transferAmountWhitelabel: async (whiteLabelUsername, hyperAgentUserName, trnsfAmnt) => {
        try {
            const whiteLabel = await Admin.findOne({ userName: whiteLabelUsername }).exec();
    
            if (!whiteLabel) {
                throw { code: 404, message: "whiteLabel Not Found For Transfer" };
            }
    
            const hyperAgent = await Admin.findOne({ userName: hyperAgentUserName }).exec();
    
            if (!hyperAgent) {
                throw { code: 404, message: "Hyper Agent Not Found" };
            }
    
            if (whiteLabel.balance < trnsfAmnt) {
                throw { code: 400, message: "Insufficient balance for the transfer" };
            }
    
            const transferRecordDebit = {
                transactionType:"Debit",
                amount: trnsfAmnt,
                userName: hyperAgent.userName,
                date: new Date()
            };
    
            const transferRecordCredit = {
                transactionType:"Credit",
                amount: trnsfAmnt,
                userName: whiteLabel.userName,
                date: new Date()
            };
    
            whiteLabel.balance -= trnsfAmnt;
            hyperAgent.balance += trnsfAmnt;
    
            if (!whiteLabel.transferAmount) {
                whiteLabel.transferAmount = [];
            }
    
            whiteLabel.transferAmount.push(transferRecordDebit); 
            hyperAgent.transferAmount.push(transferRecordCredit);
    
            await whiteLabel.save();
            await hyperAgent.save();
            return { message: "Balance Transfer Successfully" };
        } catch (err) {
            throw { code: err.code, message: err.message };
        }
    }
    
}