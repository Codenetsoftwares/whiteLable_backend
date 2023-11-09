import mongoose from "mongoose";

export const Admin = new mongoose.model("SuperAdmin", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    email: {type:String, require: true},
    tokens: { ResetPassword: { type: String } },
    roles: [{ type: String, required: true }],
    balance: { type: Number, default: 0},
    depositBalance: { type: Number, default: 0 },
    transferAmount: [
        {
            amount: { type: Number, default: 0 },
            userName: { type: String },
            date: { type: Date }
        }
    ]    
    
      
}), 'SuperAdmin');