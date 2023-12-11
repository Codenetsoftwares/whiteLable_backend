import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import { Trash } from "../models/trash.model.js";

export const AdminController = {
    createAdmin: async (data, user) => {
        if (!data.userName) {
            throw ({ message: "userName Is Required" })
        }
        if (!data.password) {
            throw ({ message: "Password Is Required" })
        }
        if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
            throw { code: 400, message: "Roles is required" };
        }
        if (user.isActive === false) {
            throw { code: 400, message: "Account is in Inactive Mode" };
        }
        const existingAdmin = await Admin.findOne({ userName: data.userName })
        if (existingAdmin) {
            throw ({ code: 409, message: "Admin Already Exist" })
        }
        const Passwordsalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
        const newAdmin = new Admin({
            userName: data.userName,
            password: encryptedPassword,
            roles: data.roles,
            createBy: user._id
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

        if (existingUser.locked === false) {
            throw { code: 401, message: "User account is locked" };
        }
        const passwordValid = await bcrypt.compare(password, existingUser.password);
        if (!passwordValid) {
            throw { code: 401, message: "Invalid User Name or password" };
        }

        console.log("Hashed password:", existingUser.password);


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
            balance: existingUser.balance,
            loadBalance: existingUser.loadBalance,
            isActive: existingUser.isActive

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

    //create user

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

    // Transfer Amount To Only Created Account

    transferAmountadmin: async (userId, receiveUserId, trnsfAmnt, remarks) => {
        try {
            const admin = await Admin.findById({ _id: userId }).exec();

            if (!admin) {
                throw { code: 404, message: "Admin Not Found For Transfer" };
            }

            const receiveUser = await Admin.findById({ _id: receiveUserId, createBy: userId }).exec();

            if (!receiveUser) {
                throw { code: 404, message: "Receive User Not Found or Not Created by the Admin" };
            }

            if (!admin.isActive) {
                throw { code: 404, message: 'Admin is inactive' };
            }

            if (!receiveUser.isActive) {
                throw { code: 404, message: 'Receive User is inactive' };
            }

            if (admin.balance < trnsfAmnt) {
                throw { code: 400, message: "Insufficient balance for the transfer" };
            }

            if (!receiveUser.createBy.equals(admin._id)) {
                throw { code: 403, message: "You can only send money to users created by you." };
            }

            const transferRecordDebit = {
                transactionType: "Debit",
                amount: trnsfAmnt,
                From: admin.userName,
                To: receiveUser.userName,
                date: new Date(),
                remarks: remarks
            };

            const transferRecordCredit = {
                transactionType: "Credit",
                amount: trnsfAmnt,
                From: admin.userName,
                To: receiveUser.userName,
                date: new Date(),
                remarks: remarks
            };

            admin.remarks = remarks;
            admin.balance -= trnsfAmnt;
            receiveUser.balance += trnsfAmnt;
            receiveUser.loadBalance += trnsfAmnt;

            if (!admin.transferAmount) {
                admin.transferAmount = [];
            }

            admin.transferAmount.push(transferRecordDebit);
            receiveUser.transferAmount.push(transferRecordCredit);

            await admin.save();
            await receiveUser.save();

            return { message: "Balance Transfer Successfully" };
        } catch (err) {
            throw { code: err.code, message: err.message };
        }
    },


    // User Active status

    activateAdmin: async (adminId, isActive, locked) => {
        try {
            const admin = await Admin.findById(adminId);
            console.log('admin', admin._id)
            const whiteLabel = await Admin.find({ createBy: adminId, roles: { $in: ["WhiteLabel"] } }).exec();
            console.log('whiteLabel', whiteLabel)
            const hyperAgent = await Admin.find({ createBy: adminId, roles: { $in: ["HyperAgent"] } }).exec();
            console.log('hyperAgent', hyperAgent)
            const masterAgent = await Admin.find({ createBy: adminId, roles: { $in: ["MasterAgent"] } }).exec();
            console.log('masterAgent', masterAgent)
            const superAgent = await Admin.find({ createBy: adminId, roles: { $in: ["SuperAgent"] } }).exec();
            console.log('superAgent', superAgent)
            if (!admin) {
                throw { code: 404, message: "Admin not found" };
            }
            if (isActive === true) {
                admin.isActive = true;
                admin.locked = true;
                superAgent.map((data) => {
                    // console.log('data', data.length)
                    if (data.isActive === false && data.hyperActive === true) {
                        data.isActive = true;
                        data.locked = true;
                        data.hyperActive = false;
                    }
                    else if (data.isActive === false && data.hyperActive === false) {
                        data.isActive = false;
                        data.locked = true;
                    }
                })
                console.log('zero')
                hyperAgent.forEach((data) => {
                    console.log('first', data)
                    if (data.isActive === false  && data.hyperActive === true) {
                        data.isActive = true;
                        data.locked = true;
                        data.hyperActive = false;
                    }
                    else if (data.isActive === false   && data.hyperActive === false) {
                        data.isActive = false;
                        data.locked = true;
                        // data.hyperActive = false;
                    }
                });
                masterAgent.forEach((data) => {
                    if (data.isActive === false && data.hyperActive === true) {
                        data.isActive = true;
                        data.locked = true;
                        data.hyperActive = false;
                    }
                    else if (data.isActive === false && data.hyperActive === false) {
                        data.isActive = false;
                        data.locked = true;
                    }

                })
                whiteLabel.forEach((data) => {
                    if (data.isActive === false && data.hyperActive === true) {
                        data.isActive = true;
                        data.locked = true;
                        data.hyperActive = false;
                    }
                    else if (data.isActive === false && data.hyperActive === false) {
                        data.isActive = false;
                        data.locked = true;
                    }

                })

                console.log('hyper', hyperAgent)
                await admin.save();
                await Promise.all(hyperAgent.map(data => data.save()));
                await Promise.all(masterAgent.map(data => data.save()));
                await Promise.all(whiteLabel.map(data => data.save()));
                await Promise.all(superAgent.map(data => data.save()));
                return { message: "Admin activated successfully" };
            }
            else if (isActive === false) {
                if (locked === false) {
                    admin.locked = false;
                    admin.isActive = false;
                    superAgent.forEach((data) => {
                        if (data.isActive === true && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                        }
                    });
                    hyperAgent.forEach((data) => {
                        if (data.isActive === true && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                            // data.hyperActive = true;
                        }
                    });
                    masterAgent.forEach((data) => {
                        if (data.isActive === true && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                        }
                    });
                    whiteLabel.forEach((data) => {
                        if (data.isActive === true && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.locked = false;
                        }
                    });

                    await admin.save();
                    await Promise.all(hyperAgent.map(data => data.save()));
                    await Promise.all(masterAgent.map(data => data.save()));
                    await Promise.all(whiteLabel.map(data => data.save()));
                    await Promise.all(superAgent.map(data => data.save()));
                    return { message: "Admin locked successfully" };
                } else {
                    admin.isActive = false;
                    superAgent.forEach((data) => {
                        if (data.isActive === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = false;
                        }
                    });
                    hyperAgent.forEach((data) => {
                        if (data.isActive === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = false;
                        }
                        // else if (data.isActive === false && data.locked === false && data.hyperActive === false) {
                        //     data.isActive = false;
                        //     data.hyperActive = true;
                        // }
                    });
                    masterAgent.forEach((data) => {
                        if (data.isActive === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = false;
                        }
                    });
                    whiteLabel.forEach((data) => {
                        if (data.isActive === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = true;
                        }
                        else if (data.isActive === false && data.locked === true && data.hyperActive === false) {
                            data.isActive = false;
                            data.hyperActive = false;
                        }
                    });
                    await admin.save();
                    await Promise.all(hyperAgent.map(data => data.save()));
                    await Promise.all(masterAgent.map(data => data.save()));
                    await Promise.all(whiteLabel.map(data => data.save()));
                    await Promise.all(superAgent.map(data => data.save()));

                    return { message: "Admin Suspended successfully" };
                }
            }
        } catch (err) {
            throw { code: err.code || 500, message: err.message || "Internal Server Error" };
        }
    },

    editCreditRef: async (adminId, creditRef) => {
        try {
            if (typeof creditRef !== 'number' || isNaN(creditRef)) {
                throw { code: 400, message: 'Invalid creditRef value' };
            }

            const admin = await Admin.findById(adminId);

            if (!admin) {
                throw { code: 404, message: 'Admin not found' };
            }

            if (admin.isActive === false) {
                return { code: 200, message: 'Admin is inactive. Update not allowed.' };
            }

            admin.creditRef = creditRef;
            admin.creditRefDate = new Date();

            const updatedAdmin = await admin.save();

            if (!updatedAdmin) {
                throw { code: 500, message: 'Cannot update admin creditRef' };
            }

            return updatedAdmin;
        } catch (error) {
            throw { code: error.code || 500, message: error.message };
        }

    },

    trashAdminUser: async (adminUserId) => {
        try {
            const existingAdminUser = await Admin.findById(adminUserId);

            if (!existingAdminUser) {
                throw { code: 404, message: `Admin User not found with id: ${adminUserId}` };
            }

            const updatedTransactionData = {
                id: existingAdminUser._id,
                roles: existingAdminUser.roles,
                userName: existingAdminUser.userName,
                balance: existingAdminUser.balance,
                loadBalance: existingAdminUser.loadBalance,
                creditRef: existingAdminUser.creditRef,
                refProfitLoss: existingAdminUser.refProfitLoss,
                createBy: existingAdminUser.createBy
            };

            const backupTransaction = new Trash(updatedTransactionData);
            await backupTransaction.save();

            const deletedAdminUser = await Admin.findByIdAndDelete(adminUserId);

            if (!deletedAdminUser) {
                throw { code: 500, message: `Failed to delete Admin User with id: ${adminUserId}` };
            }

            return true;
        } catch (error) {
            throw error;
        }
    },

    restoreUser: async (adminId) => {
        try {
            const existingAdminUser = await Trash.findById(adminId);

            if (!existingAdminUser) {
                throw { code: 404, message: `Admin not found in trash` };
            }

            const restoreRemoveData = {
                roles: existingAdminUser.roles,
                userName: existingAdminUser.userName,
                balance: existingAdminUser.balance,
                loadBalance: existingAdminUser.loadBalance,
                creditRef: existingAdminUser.creditRef,
                refProfitLoss: existingAdminUser.refProfitLoss,
                createBy: existingAdminUser.createBy,
            };
            const restoreTransaction = new Admin(restoreRemoveData);
            await restoreTransaction.save();
            await Trash.findByIdAndDelete(adminId);

            return true;
        } catch (err) {
            console.error(err);
            throw { code: 500, message: err.message };
        }
    },

    // Partnership

    editPartnership: async (adminId, partnership) => {
        try {
            const admin = await Admin.findById(adminId);

            if (!admin) {
                throw { code: 404, message: "Admin not found" };
            }

            if (admin.isActive === false) {
                return { code: 200, message: 'Admin is inactive. Update not allowed.' };
            }

            admin.partnership = partnership;
            admin.partnershipDate = new Date();

            const updatedAdmin = await admin.save();

            if (!updatedAdmin) {
                throw { code: 500, message: 'Cannot update admin creditRef' };
            }

            return updatedAdmin;
        } catch (err) {
            throw err;
        }
    },

    // partnership: async (adminId, partnership) => {
    //     try {
    //         const admin = await Admin.findById(adminId).exec();

    //         if (!admin) {
    //             throw { code: 404, message: "Invalid Credentails" };
    //         }
    //         admin.partnership = partnership;
    //         admin.creditRefDate = new Date();
    //         await admin.save();

    //         return { message: "Partnership Succesfull" };
    //     } catch (error) {
    //         throw { code: error.code, message: error.message };

    //     }
    // },

}
