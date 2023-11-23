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

    // trasfer amount super agent to master agent
 
    transferAmountSuperagent: async (SuperAgentUserName,masterAgentUserName,trnsfAmnt) => {
        try {
            const superAgent = await Admin.findOne({ userName: SuperAgentUserName ,roles: { $in: ["SuperAgent"]}}).exec();
    
            if (!superAgent) {
                throw { code: 404, message: "superAgent Not Found For Transfer" };
            }
    
            const masterAgent = await Admin.findOne({ userName: masterAgentUserName,roles: { $in: ["MasterAgent"] } }).exec();
    
            if (!masterAgent) {
                throw { code: 404, message: "masterAgent Not Found" };
            }
    
            if (!superAgent.isActive) {
                throw { code: 401, message: 'superAgent is inactive' };
            }
      
            if (!masterAgent.isActive) {
                throw { code: 401, message: 'masterAgent is inactive' };
            }

            if (superAgent.balance < trnsfAmnt) {
                throw { code: 400, message: "Insufficient balance for the transfer" };
            }
            const transferRecordDebit = {
                transactionType:"Debit",
                amount: trnsfAmnt,
                userName: masterAgent.userName,
                date: new Date()
            };
    
            const transferRecordCredit = {
                transactionType:"Credit",
                amount: trnsfAmnt,
                userName: superAgent.userName,
                date: new Date()
            };
         
            superAgent.balance -= trnsfAmnt;
            masterAgent.balance += trnsfAmnt;
            masterAgent.loadBalance += trnsfAmnt
    
            if (!superAgent.transferAmount) {
                superAgent.transferAmount = [];
            }

            superAgent.transferAmount.push(transferRecordDebit); 
            masterAgent.transferAmount.push(transferRecordCredit);

            await superAgent.save();
            await masterAgent.save();

            return { message: "Balance Transfer Successfully" };
          } catch (err) {
            throw { code: err.code, message: err.message };
          }
    },
}