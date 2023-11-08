import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";


export const SuperAgentController = {
    
    // SuperAgentLoginToken: async(userName,password) => {
    //     if (!userName) {
    //         throw { code: 400, message: 'Invalid userName' };
    //       }
    //       if (!password) {
    //         throw { code: 400, message: 'Invalid password' };
    //       }
    //       const existingSuperAgent = await SuperAgent.findOne({ userName: userName });
         
    //       if (!existingSuperAgent) {
    //         throw { code: 400, message: 'Invalid userName or Password' };
    //       }
    //       const isPasswordValid = await bcrypt.compare(password, existingSuperAgent.password);
        
    //       if (!isPasswordValid) {
    //         throw { code: 401, message: 'Invalid userName or Password' };
    //       }
    //       const accessTokenResponse = {
    //         id: existingSuperAgent._id,
    //         userName: existingSuperAgent.userName,
    //       };
    //       const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
    //         expiresIn: '1d',
    //       });
    //       return {
    //         userName: existingSuperAgent.userName,
    //         accessToken: accessToken,
    //       };
    //     },
 
    transferAmount: async (superAgentUserName,masterAgentUserName, trnsfAmnt) => {
        try {
            const superAgent = await Admin.findOne({ userName: superAgentUserName }).exec();
    
            if (!superAgent) {
                throw { code: 404, message: "superAgent Not Found For Transfer" };
            }
    
            const masterAgent = await Admin.findOne({ userName: masterAgentUserName }).exec();
    
            if (!masterAgent) {
                throw { code: 404, message: "masterAgent Not Found" };
            }
    
            if (superAgent.balance < trnsfAmnt) {
                throw { code: 400, message: "Insufficient balance for the transfer" };
            }
            
            superAgent.balance -= trnsfAmnt;
            masterAgent.balance += trnsfAmnt;
            // superAgent.transferAmount += trnsfAmnt;
    
            await superAgent.save();
            await masterAgent.save();
            return { message: "Balance Transfer Successfully" };
          } catch (err) {
            throw { code: err.code, message: err.message };
          }
    },
}