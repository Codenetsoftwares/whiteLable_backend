import mongoose from "mongoose";

export const HyperAgent = new mongoose.model("HyperAgent", new mongoose.Schema({
    
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "hyperAgent" },
    balance: { type: Number, default: 0},
    transferAmount:{type:Number, default: 0}

}), 'hyperAgent');