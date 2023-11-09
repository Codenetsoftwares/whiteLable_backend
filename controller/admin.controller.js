import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
// import { SubAdmin } from "../models/subAdmin.model.js";
// import { WhiteLabel } from "../models/whiteLabel.model.js";
// import {HyperAgent} from "../models/hyperAgent.model.js"
// import {MasterAgent} from "../models/master.model.js"
// import {SuperAgent} from "../models/superAgent.model.js"
// import {User} from "../models/user.model.js"
// import crypto from "crypto"
// import nodemailer from "nodemailer";

export const AdminController = {

    createAdmin: async (data) => {
        const existingAdmin = await Admin.findOne({ userName: data.userName })
        if (existingAdmin) {
            throw ({ code: 409, message: "Admin Already Exist" })
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
        const newAdmin = new Admin({
            userName: data.userName,
            password: encryptedPassword,
            roles: data.roles,
        });
        newAdmin.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save user" };
        });

    },

    GenerateAdminAccessToken: async (userName, password, persist) => {
        if (!userName) {
            throw { code: 400, message: "Invalid value for: User Name" };
        }
        if (!password) {
            throw { code: 400, message: "Invalid value for: password" };
        }

        const existingUser = await AdminController.findAdmin({
            userName: userName,
        });
        console.log(existingUser)
        if (!existingUser) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

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
    },

    findAdminById: async (id) => {
        if (!id) {
            throw { code: 409, message: "Required parameter: id" };
        }

        return Admin.findById(id).exec();
    },

    findAdmin: async (filter) => {
        if (!filter) {
            throw { code: 409, message: "Required parameter: filter" };
        }
        return Admin.findOne(filter).exec();
    },


    PasswordResetCode: async (userName, oldPassword, password) => {
        const existingUser = await AdminController.findAdmin({
          userName: userName,
        });
    
        const oldPasswordIsCorrect = await bcrypt.compare(
          oldPassword,
          existingUser.password
        );
    
        if (!oldPasswordIsCorrect) {
          throw {
            code: 401,
            message: "Invalid old password",
          };
        }
    
        const passwordIsDuplicate = await bcrypt.compare(
          password,
          existingUser.password
        );
    
        if (passwordIsDuplicate) {
          throw {
            code: 409,
            message: "New Password cannot be the same as existing password",
          };
        }
    
        const passwordSalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(password, passwordSalt);
    
        existingUser.password = encryptedPassword;
        existingUser.save().catch((err) => {
          console.error(err);
          throw { code: 500, message: "Failed to save new password" };
        });
    
        return true;
      },
    // create sub admin

    // CreateSubAdmin: async (data) => {
    //     const existingSubadmin = await Admin.findOne({ userName: data.userName })
    //     console.log(existingSubadmin)
    //     if (existingSubadmin) {
    //         throw ({ code: 409, message: "Sub Admin Already Exist" })
    //     }
    //     if (!data.userName) {
    //         throw ({ message: "userName Is Required" })
    //     }
    //     if (!data.password) {
    //         throw ({ message: "Password Is Required" })
    //     }

    //     const Passwordsalt = await bcrypt.genSalt();
    //     const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    //     const newSubAdmin = new SubAdmin({
    //         userName: data.userName,
    //         roles: data.roles,
    //         password: encryptedPassword,

    //     });
    //     newSubAdmin.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save SubAdmin" };
    //     });
    // },


    // create white Label

    // CreateWhiteLabel: async (data) => {
    //     const existingWhitelabel = await Admin.findOne({ userName: data.userName })
    //     console.log(existingWhitelabel)
    //     if (existingWhitelabel) {
    //         throw ({ code: 409, message: "White Label User Already Exist" })
    //     }
    //     if (!data.userName) {
    //         throw ({ message: "userName Is Required" })
    //     }
    //     if (!data.password) {
    //         throw ({ message: "Password Is Required" })
    //     }

    //     const Passwordsalt = await bcrypt.genSalt();
    //     const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    //     const newWhiteLabel = new WhiteLabel({
    //         userName: data.userName,
    //         password: encryptedPassword,

    //     });
    //     newWhiteLabel.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save WhiteLabel" };
    //     });
    // },


    //create Hyper Agent

    // CreateHyperAgent: async (data) => {
    //     const existingHyperAgent = await HyperAgent.findOne({ userName: data.userName })
    //     console.log(existingHyperAgent)
    //     if (existingHyperAgent) {
    //         throw ({ code: 409, message: "Hyper Agent Already Exist" })
    //     }
    //     if (!data.userName) {
    //         throw ({ message: "userName Is Required" })
    //     }
    //     if (!data.password) {
    //         throw ({ message: "Password Is Required" })
    //     }

    //     const Passwordsalt = await bcrypt.genSalt();
    //     const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    //     const newHyperAgent = new HyperAgent({
    //         userName: data.userName,
    //         password: encryptedPassword,

    //     });
    //     newHyperAgent.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save HyperAgent" };
    //     });
    // },

    //create Super Agent

    // CreateSuperAgent: async (data) => {
    //     const existingSuperAgent = await SuperAgent.findOne({ userName: data.userName })
    //     console.log(existingSuperAgent)
    //     if (existingSuperAgent) {
    //         throw ({ code: 409, message: "Super Agent Already Exist" })
    //     }
    //     if (!data.userName) {
    //         throw ({ message: "userName Is Required" })
    //     }
    //     if (!data.password) {
    //         throw ({ message: "Password Is Required" })
    //     }

    //     const Passwordsalt = await bcrypt.genSalt();
    //     const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    //     const newSuperAgent = new SuperAgent({
    //         userName: data.userName,
    //         password: encryptedPassword,

    //     });
    //     newSuperAgent.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save super Agent" };
    //     });
    // },



    //create Hyper Agent

    // CreateMasterAgent: async (data) => {
    //     const existingMasterAgent = await MasterAgent.findOne({ userName: data.userName })
    //     console.log(existingMasterAgent)
    //     if (existingMasterAgent) {
    //         throw ({ code: 409, message: "Master Agent Already Exist" })
    //     }
    //     if (!data.userName) {
    //         throw ({ message: "userName Is Required" })
    //     }
    //     if (!data.password) {
    //         throw ({ message: "Password Is Required" })
    //     }

    //     const Passwordsalt = await bcrypt.genSalt();
    //     const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    //     const newMasterAgent = new MasterAgent({
    //         userName: data.userName,
    //         password: encryptedPassword,

    //     });
    //     newMasterAgent.save().catch((err) => {
    //         console.error(err);
    //         throw { code: 500, message: "Failed to save Master Agent" };
    //     });
    // },



    //create Hyper Agent

    CreateUser: async (data) => {
        const existingUser = await User.findOne({ userName: data.userName })
        console.log(existingUser)
        if (existingUser) {
            throw ({ code: 409, message: "User Already Exist" })
        }
        if (!data.userName) {
            throw ({ message: "userName Is Required" })
        }
        if (!data.password) {
            throw ({ message: "Password Is Required" })
        }

        const Passwordsalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
        const newUser = new User({
            userName: data.userName,
            password: encryptedPassword,

        });
        newUser.save().catch((err) => {
            console.error(err);
            throw { code: 500, message: "Failed to save User" };
        });
    },

    // Deposit Amount 

    Deposit: async (adminId, depositAmount) => {
        try {
            const admin = await Admin.findById(adminId).exec();
    
            if (!admin) {
                throw { code: 404, message: "Admin Not Found For Deposit" };
            }

            admin.depositBalance += depositAmount;
            admin.balance += depositAmount;
    
            await admin.save();
    
            return { message: "Balance Deposit Successfully" };
        } catch (err) {
            throw { code: err.code, message: err.message };
        }
    },

  // admin transfer amount to white label transfer amount
transferAmountadmin: async (adminUserName, whiteLabelUsername, trnsfAmnt) => {
    try {
        const admin = await Admin.findOne({ userName: adminUserName }).exec();

        if (!admin) {
            throw { code: 404, message: "Admin Not Found For Transfer" };
        }

        const whiteLabel = await Admin.findOne({ userName: whiteLabelUsername }).exec();

        if (!whiteLabel) {
            throw { code: 404, message: "White Label Not Found" };
        }

        if (admin.balance < trnsfAmnt) {
            throw { code: 400, message: "Insufficient balance for the transfer" };
        }
        const transferRecord = {
            amount: trnsfAmnt,
            userName: whiteLabel.userName,
            date: new Date()
        };
        admin.balance -= trnsfAmnt;
        whiteLabel.balance += trnsfAmnt;

        if (!admin.transferAmount) {
            admin.transferAmount = [];
        }

        admin.transferAmount.push(transferRecord);

        await admin.save();
        await whiteLabel.save();
        return { message: "Balance Transfer Successfully" };
    } catch (err) {
        throw { code: err.code, message: err.message };
    }
}


}