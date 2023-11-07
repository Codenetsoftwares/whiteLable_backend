import mongoose from "mongoose";

export const SubAdmin = new mongoose.model("SubAdmin", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "subadmin" },
    balance: { type: Number, default: 0},
    transferAmount:{type:Number, default: 0}
}), 'Subadmin');