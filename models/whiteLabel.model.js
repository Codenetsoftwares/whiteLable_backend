import mongoose from "mongoose";

export const WhiteLabel = new mongoose.model("WhiteLabel", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "whiteLabel" },
}), 'whiteLabel');