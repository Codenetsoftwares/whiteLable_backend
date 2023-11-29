// import bcrypt from "bcryptjs"
// import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";



export const WhiteLabelController = {

    // tarnsfer amount white label to hyper agent

    transferAmountWhitelabel: async (whiteLabelUsername, hyperAgentUserName, trnsfAmnt,remarks) => {
        try {
            const whiteLabel = await Admin.findOne({ userName: whiteLabelUsername ,roles: { $in: ["WhiteLabel"]} }).exec();
    
            if (!whiteLabel) {
                throw { code: 404, message: "whiteLabel Not Found For Transfer" };
            }
    
            const hyperAgent = await Admin.findOne({ userName: hyperAgentUserName,roles: { $in: ["HyperAgent"] } }).exec();
    
            if (!hyperAgent) {
                throw { code: 404, message: "Hyper Agent Not Found" };
            }

            if (!whiteLabel.isActive) {
                throw { code: 401, message: 'superAgent is inactive' };
            }
      
            if (!hyperAgent.isActive) {
                throw { code: 401, message: 'masterAgent is inactive' };
            }
    
            if (whiteLabel.balance < trnsfAmnt) {
                throw { code: 400, message: "Insufficient balance for the transfer" };
            }
    
            const transferRecordDebit = {
                transactionType:"Debit",
                amount: trnsfAmnt,
                From: whiteLabel.userName,
                To: hyperAgent.userName,
                date: new Date()
            };
    
            const transferRecordCredit = {
                transactionType:"Credit",
                amount: trnsfAmnt,
                From: whiteLabel.userName,
                To: hyperAgent.userName,
                date: new Date(),
                remarks : remarks 
            };
   
            whiteLabel.remarks = remarks;
            whiteLabel.balance -= trnsfAmnt;
            hyperAgent.balance += trnsfAmnt;
            hyperAgent.loadBalance += trnsfAmnt;
            hyperAgent.creditRef += trnsfAmnt;
            hyperAgent.refProfitLoss = hyperAgent.creditRef - hyperAgent.balance;
            whiteLabel.refProfitLoss = whiteLabel.creditRef - whiteLabel.balance;
    
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