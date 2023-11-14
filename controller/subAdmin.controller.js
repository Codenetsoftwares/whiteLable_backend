import bcrypt from "bcryptjs"
import  jwt from "jsonwebtoken";
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

    findAdminById: async (id) => {
        if (!id) {
            throw { code: 409, message: "Required parameter: id" };
        }

        return Admin.findById(id).exec();
    },

    findSubAdmin: async (filter) => {
        if (!filter) {
            throw { code: 409, message: "Required parameter: filter" };
        }
        return SubAdmin.findOne(filter).exec();
    },


    GenerateSubAdminAccessToken: async (userName, password, persist) => {
        
        if (!userName) {
            throw { code: 400, message: "Invalid value for: User Name" };
        }
        if (!password) {
            throw { code: 400, message: "Invalid value for: password" };
        }
        const existingUser = await SubAdmin.findOne({userName: userName});
        // console.log(existingUser)
        if (!existingUser) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

        // console.log("Hashed password:", existingUser.password);


        const accessTokenResponse = {
            id: existingUser._id,
            userName: existingUser.userName,
            role: existingUser.roles,
        };

        const accessToken = jwt.sign(
            accessTokenResponse,
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: persist ? "1y" : "8h",
            }
        );

        return {
            userName: existingUser.userName,
            accessToken: accessToken,
            role: existingUser.roles,
            balance: existingUser.balance
        };
    }
}