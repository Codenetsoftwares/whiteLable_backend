    import bcrypt from "bcryptjs"
    import jwt from "jsonwebtoken";
    import { Admin } from "../models/admin.model.js";
    import { User } from "../models/user.model.js";
    import { Trash } from "../models/trash.model.js";

    export const AdminController = {
        createAdmin: async (data,user) => {
            if (!data.userName) {
                throw ({ message: "userName Is Required" })
            }
            if (!data.password) {
                throw ({ message: "Password Is Required" })
            }
            if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
                throw { code: 400, message: "Roles is required" };
            }
            if(user.isActive === false){
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
                loadBalance :existingUser.loadBalance,
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

    // admin transfer amount to white label transfer amount
        transferAmountadmin: async (adminUserName, whiteLabelUsername, trnsfAmnt,remarks) => {
        try {
            const admin = await Admin.findOne({ userName: adminUserName ,roles: { $in: ["superAdmin"]}}).exec();

            if (!admin) {
                throw { code: 404, message: "Admin Not Found For Transfer" };
            }

            const whiteLabel = await Admin.findOne({ userName: whiteLabelUsername ,roles: { $in: ["WhiteLabel"] } }).exec();

            if (!whiteLabel) {
                throw { code: 404, message: "White Label Not Found" };
            }


            if (!admin.isActive) {
                throw { code: 404, message: 'Admin is inactive' };
            }

            if (!whiteLabel.isActive) {
                throw { code: 404, message: 'White Label is inactive' };
            }


            if (admin.balance < trnsfAmnt) {
                    throw { code: 400, message: "Insufficient balance for the transfer" };
                }
        
                const transferRecordDebit = {
                    transactionType:"Debit",
                    amount: trnsfAmnt,
                    From: admin.userName,
                    To: whiteLabel.userName,
                    date: new Date(),
                    remarks : remarks 
                    
                };
        
                const transferRecordCredit = {
                    transactionType:"Credit",
                    amount: trnsfAmnt,
                    From: admin.userName,
                    To: whiteLabel.userName,
                    date: new Date(),
                    remarks : remarks 
                };
                admin.remarks = remarks;
                admin.balance -= trnsfAmnt;
                whiteLabel.balance += trnsfAmnt;
                whiteLabel.loadBalance += trnsfAmnt;
                whiteLabel.creditRef += trnsfAmnt;
                whiteLabel.refProfitLoss =  whiteLabel.creditRef - whiteLabel.balance;

                if (!admin.transferAmount) {
                    admin.transferAmount = [];
                }

                admin.transferAmount.push(transferRecordDebit); 
                whiteLabel.transferAmount.push(transferRecordCredit);   
            

            await admin.save();
            await whiteLabel.save();
            return { message: "Balance Transfer Successfully" };
        } catch (err) {
            throw { code: err.code, message: err.message };
        }
    },

    // User Active status

    activateAdmin: async (adminId, isActive, locked) => {
        try {
            const admin = await Admin.findById(adminId);
    
            if (!admin) {
                throw { code: 404, message: "Admin not found" };
            }       
    
            if (isActive ) {
                admin.isActive = true;               
                await admin.save();
                return { message: "Admin activated successfully" };
            }
             else if(locked){
                admin.locked = true;
                await admin.save();
                return { message: "Admin unlocked successfully"}
              } 
              else if (isActive === false){
                admin.isActive = false;
                // admin.locked = false;
                await admin.save();
                return { message: "Admin inactivated successfully" };
            } else{
                admin.locked = false;
                await admin.save();
                return { message: "Admin locked successfully" };
            }
    
        } catch (err) {
            throw { code: err.code || 500, message: err.message || "Internal Server Error" };
        }
    },
    

    editCreditRef: async (adminId, creditRef) => {
        try{
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
        admin.refProfitLoss = creditRef - admin.balance;

        const updatedAdmin = await admin.save();

        if (!updatedAdmin) {
            throw { code: 500, message: 'Can not updating admin creditRef' };
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
      
      
      
}
    