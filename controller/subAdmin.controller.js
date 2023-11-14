import bcrypt from "bcryptjs"
import { SubAdmin } from "../models/subAdmin.model.js";


export const SubAdminController = {
    
    // create every sub admins
    createSubAdmin: async (data) => {
        const existingAdmin = await SubAdmin.findOne({ userName: data.userName })
        if (existingAdmin) {
            throw ({ code: 409, message: "User Already Exist" })
        }
        if (!data.userName) {
            throw ({ message: "userName Is Required" })
        }
        if (!data.password) {
            throw ({ message: "Password Is Required" })
        }
        if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
            throw { code: 400, message: "Roles is required" };
        }
        const Passwordsalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
        const newsubAdmin = new SubAdmin({
            userName: data.userName,
            password: encryptedPassword,
            roles: data.roles,
        });
        newsubAdmin.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save user" };
        });

    },
}