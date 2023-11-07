import mongoose from "mongoose";

export const MasterAgent = new mongoose.model("MasterAgent", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "masterAgent" },
    balance: { type: Number, default: 0},
    transferAmount:{type:Number, default: 0}
}), 'masterAgent');