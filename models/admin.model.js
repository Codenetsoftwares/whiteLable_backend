import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const Admin = new mongoose.model("Admin", new mongoose.Schema({
    userName: { type: String, required: true },
    password: { type: String, },
    tokens: { ResetPassword: { type: String } },
    roles: [{ type: String, required: true }],
    balance: { type: Number, default: 0 },
    depositBalance: { type: Number, default: 0 },
    ip: {
        IP: { type: String },
        country: { type: String },
        region: { type: String },
        timezone: { type: String }
    },
    transferAmount: [
        {
            amount: { type: Number, default: 0 },
            userName: { type: String },
            date: { type: Date },
            transactionType: { type: String },
            remarks: { type: String },
            From: { type: String },
            To: { type: String },
            debitBalance: { type: Number, default: 0 },
        }
    ],
    loadBalance: { type: Number, default: 0 },
   
    creditRef: [
        {
            value: { type: Number, default: 0 },
            date: { type: Date, default: Date.now },
        },
    ],
  
    partnership: [
        {
            value: { type: Number, default: 0 },
            date: { type: Date, default: Date.now },
        },
    ],
    
    createBy: { type: ObjectId },
    isActive: { type: Boolean, default: true, required: true },
    locked: { type: Boolean, default: true, require: true },
    hyperActive: { type: Boolean, default: false, required: false },
    masterActive: { type: Boolean, default: false, required: false },
    superActive: { type: Boolean, default: false, required: false },
    whiteActive: { type: Boolean, default: false, required: false },
    checkActive: { type: Boolean, default: false, required: false },


}), 'Admin');