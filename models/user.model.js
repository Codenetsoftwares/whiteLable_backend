import mongoose from "mongoose";

export const User = new mongoose.model("User", new mongoose.Schema({
    userName:  { type: String, required: true },
    password:   { type: String, required: true },
    roles: { type: String, default: "user" },
    isActive: {type: Boolean, default: false, required: true}
}), 'user');