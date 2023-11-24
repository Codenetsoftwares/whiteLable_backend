// import bcrypt from "bcryptjs"
// import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";



export const WhiteLabelController = {

    // tarnsfer amount white label to hyper agent

    transferAmountWhitelabel: async (whiteLabelUsername, hyperAgentUserName, trnsfAmnt) => {
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
                userName: hyperAgent.userName,
                date: new Date().toLocaleDateString('en-GB')
            };
    
            const transferRecordCredit = {
                transactionType:"Credit",
                amount: trnsfAmnt,
                userName: whiteLabel.userName,
                date: new Date().toLocaleDateString('en-GB')
            };
    
            whiteLabel.balance -= trnsfAmnt;
            hyperAgent.balance += trnsfAmnt;
            hyperAgent.loadBalance += trnsfAmnt
    
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