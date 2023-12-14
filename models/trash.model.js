import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export const Trash = new mongoose.model("Trash", new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId },
    roles: [{ type: String, required: true }],
    userName:  { type: String, required: true },
    password: { type: String },
    balance: { type: Number, default: 0},
    loadBalance : {type : Number , default : 0},
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
    refProfitLoss : {type : Number, default : 0},
    createBy : {type:ObjectId},
      
}), 'Trash');