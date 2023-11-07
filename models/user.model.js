import mongoose from "mongoose";

export const User = new mongoose.model("User", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    role: { type: String, default: "user" },
}), 'user');