import mongoose from "mongoose";

export const SubHyperAgent = new mongoose.model("SubHyperAgent", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "subHyperAgent" },
    balance: { type: Number, default: 0},
    transferAmount:{type:Number, default: 0}
}), 'SubHyperAgent');