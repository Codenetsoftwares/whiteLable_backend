import mongoose from "mongoose";

export const Admin = new mongoose.model("SuperAdmin", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    email: {type:String, require: true},
    tokens: {
        ResetPassword: { type: String },
      },
      role: { type: String, default: "superAdmin" },
      balance: { type: Number, default: 0},
      depositBalance: { type: Number, default: 0 },
      transferAmount:{type:Number, default: 0}
      
}), 'SuperAdmin');