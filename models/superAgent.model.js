import mongoose from "mongoose";

export const SuperAgent = new mongoose.model("SuperAgent", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "superAgent" },
    balance: { type: Number, default: 0},
    transferAmount:{type:Number, default: 0}
}), 'superAgent');