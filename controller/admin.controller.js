import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import { Trash } from "../models/trash.model.js";


const globalUsernames = [];

export const AdminController = {
    createAdmin: async (data, user) => {
        try {
            if (!data.userName) {
                throw { message: "userName Is Required" };
            }
            if (!data.password) {
                throw { message: "Password Is Required" };
            }
            if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
                throw { code: 400, message: "Roles is required" };
            }

            const existingAdmin = await Admin.findOne({ userName: data.userName });
            if (existingAdmin) {
                throw { code: 409, message: "Admin Already Exists" };
            }
            if (user.isActive === false || user.locked === false) {
                throw { code: 400, message: "Account is Not Active" };
            }
            const Passwordsalt = await bcrypt.genSalt();
            const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    
            const defaultPermission = "All Accesses";
    
            const rolesWithDefaultPermission = data.roles.map(role => ({
                role,
                permission: defaultPermission,
            }));
    
            const newAdmin = new Admin({
                userName: data.userName,
                password: encryptedPassword,
                roles: rolesWithDefaultPermission,
                createBy: user._id
            });
    
            await newAdmin.save();
        } catch (err) {
            console.error(err);
            throw { code: 500, message: "Failed to save user" };
        }
    },
    

    createSubAdmin: async (data, user) => {
        if (!data.userName) {
            throw { message: "userName Is Required" };
        }
        if (!data.password) {
            throw { message: "Password Is Required" };
        }
        // if (!data.roles || !Array.isArray(data.roles) || data.roles.length === 0) {
        //     throw { code: 400, message: "Roles is required" };
        // }
        if (user.isActive === false) {
            throw { code: 400, message: "Account is in Inactive Mode" };
        }
    
        const existingAdmin = await Admin.findOne({ userName: data.userName });
        if (existingAdmin) {
            throw { code: 409, message: "Admin Already Exist" };
        }
    
        const Passwordsalt = await bcrypt.genSalt();
        const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
    
        let subRole = '';
        console.log('userRoels',user.roles);
        for(let i=0; i<user.roles.length; i++){
            if (user.roles[i].role.includes('superAdmin')) {
                subRole = 'subAdmin';
            } else if (user.roles[i].role.includes('WhiteLabel')) {
                subRole = 'subWhiteLabel';
            } else if (user.roles[i].role.includes('HyperAgent')) {
                subRole = 'subHyperAgent';
            } else if (user.roles[i].role.includes('SuperAgent')) {
                subRole = 'subSuperAgent';
            } else if (user.roles[i].role.includes('MasterAgent')) {
                subRole = 'subMasterAgent';
            } else {
                throw { code: 400, message: "Invalid user role for creating sub-admin" };
            }
        }
    
        const newAdmin = new Admin({
            userName: data.userName,
            password: encryptedPassword,
            roles: [{ role: subRole, permission: data.permission }],
            createBy: user._id
        });
        try {
            await newAdmin.save();
            return newAdmin;
        } catch (err) {
            console.error(err);
            throw { code: 500, message: "Failed to save user" };
        }
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

    const accessTokenResponse = {
        id: existingUser._id,
        userName: existingUser.userName,
        roles: existingUser.roles.map(role => ({
            role: role.role,
            permission: role.permission
        }))
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
        roles: existingUser.roles.map(role => ({
            role: role.role,
            permission: role.permission
        })),
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

    PasswordResetCode: async (userName,password) => {
        try{
        const existingUser = await AdminController.findAdmin({
            userName: userName,
        });

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


        await existingUser.save();

        return { code: 200, message: "Password reset successful!" };
    }catch(err)
     {
      
            throw { code: 500, message: "Failed to save new password" };
        }
    },

    //create user

    CreateUser: async (data) => {
        try {
        const existingUser = await User.findOne({ userName: data.userName })
   
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
        newUser.save()
    }
    catch(err) {
            console.error(err);
            throw { code: 500, message: "Failed to save User" };
        };
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
console.log("adminId:", adminId); 
const admin = await Admin.findById(adminId);

const whiteLabel = await Admin.find({ createBy: adminId, roles: { $elemMatch: { role: "WhiteLabel" } } }).exec();
const hyperAgent = await Admin.find({ createBy: adminId, roles: { $elemMatch: { role: "HyperAgent" } } }).exec();
const masterAgent = await Admin.find({ createBy: adminId, roles: { $elemMatch: { role: "MasterAgent" } } }).exec();
const superAgent = await Admin.find({ createBy: adminId, roles: { $elemMatch: { role: "SuperAgent" } } }).exec();


if (whiteLabel.length == 0 && hyperAgent.length == 0 && masterAgent.length == 0 && superAgent.length == 0) {
    if (isActive === true) {
        admin.isActive = true;
        admin.locked = true;
    }
    else if (isActive === false) {
        if (locked === false) {
            admin.locked = false;
            admin.isActive = false;
        }
        else {
            admin.isActive = false;
        }
    }
    await admin.save();
    await Promise.all(hyperAgent.map(data => data.save()));
    await Promise.all(masterAgent.map(data => data.save()));
    await Promise.all(whiteLabel.map(data => data.save()));
    await Promise.all(superAgent.map(data => data.save()));
    return
}
if (!admin) {
    throw { code: 404, message: "Admin not found" };
}
if (isActive === true) {
    admin.isActive = true;
    admin.locked = true;
    superAgent.map((data) => {
        if (data.isActive === false && data.locked === false && data.superActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.superActive = false;
            data.checkActive = false;
        } //checked
        else if (data.isActive === false && data.locked === false && data.superActive === true && data.checkActive === false) {
        
            data.locked = true;
            data.superActive = false;
        } //checked
        else if (data.isActive === false && data.locked === true && data.superActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.superActive = false;
            data.checkActive = false;
        } //checked
        AdminController.activateAdmin(data._id, data.isActive, data.locked)

    })

    hyperAgent.forEach((data) => {
        if (data.isActive === false && data.locked === false && data.hyperActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.hyperActive = false;
            data.checkActive = false;
        } //checked
        else if (data.isActive === false && data.locked === false && data.hyperActive === true && data.checkActive === false) {
        
            data.locked = true;
            data.hyperActive = false;
        } //checked
        else if (data.isActive === false && data.locked === true && data.hyperActive === true && data.checkActive === true) {
            
            data.isActive = true;
            data.locked = true;
            data.hyperActive = false;
            data.checkActive = false;
        } //checked

        AdminController.activateAdmin(data._id, data.isActive, data.locked)


    })
    masterAgent.forEach((data) => {
        if (data.isActive === false && data.locked === false && data.masterActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.masterActive = false;
            data.checkActive = false;
        } //checked
        else if (data.isActive === false && data.locked === false && data.masterActive === true && data.checkActive === false) {
        
            data.locked = true;
            data.masterActive = false;
        } //checked
        else if (data.isActive === false && data.locked === true && data.masterActive === true && data.checkActive === true) {
            
            data.isActive = true;
            data.locked = true;
            data.masterActive = false;
            data.checkActive = false;
        } //checked

        AdminController.activateAdmin(data._id, data.isActive, data.locked)


    })
    whiteLabel.forEach((data) => {
        if (data.isActive === false && data.locked === false && data.whiteActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.whiteActive = false;
            data.checkActive = false;
        } //checked
        else if (data.isActive === false && data.locked === false && data.whiteActive === true && data.checkActive === false) {
        
            data.locked = true;
            data.whiteActive = false;
        } //checked
        else if (data.isActive === false && data.locked === true && data.whiteActive === true && data.checkActive === true) {
        
            data.isActive = true;
            data.locked = true;
            data.whiteActive = false;
            data.checkActive = false;
        } //checked
        AdminController.activateAdmin(data._id, data.isActive, data.locked)



    })


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

            if (data.isActive === true && data.locked === true && data.superActive === false && data.checkActive === false) {
            
                data.isActive = false;
                data.locked = false;
                data.superActive = true;
                data.checkActive = true
            } //checked

            else if (data.isActive === false && data.locked === true && data.superActive === true) {
                data.isActive = false;
                data.locked = false;
                data.checkActive = true;
    
            }
            else if (data.isActive === false && data.locked === true && data.superActive === false && data.checkActive === false) {
                data.locked = false;
                data.superActive = true;
        
            } //checked
            else if (data.isActive === false && data.locked === true && data.superActive === true && data.checkActive === true) {
                data.locked = false;
        
            } //checked
            else if (data.isActive === false && data.locked === false && data.superActive === true && data.checkActive === true) {
                data.isActive = true;
                data.locked = true;
                data.superActive = false;
                data.checkActive === false
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)

        });
        hyperAgent.forEach((data) => {
            if (data.isActive === true && data.locked === true && data.hyperActive === false && data.checkActive === false) {
            
                data.isActive = false;
                data.locked = false;
                data.hyperActive = true;
                data.checkActive = true
            } //checked

            else if (data.isActive === false && data.locked === true && data.hyperActive === true) {
                data.isActive = false;
                data.locked = false;
                data.checkActive = true;
            
            }
            else if (data.isActive === false && data.locked === true && data.hyperActive === false && data.checkActive === false) {
                data.locked = false;
                data.hyperActive = true;
            
            } //checked
            else if (data.isActive === false && data.locked === true && data.hyperActive === true && data.checkActive === true) {
                data.locked = false;
            
            } //checked
            else if (data.isActive === false && data.locked === false && data.hyperActive === true && data.checkActive === true) {
                data.isActive = true;
                data.locked = true;
                data.hyperActive = false;
                data.checkActive === false
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)

        });
        masterAgent.forEach((data) => {
            if (data.isActive === true && data.locked === true && data.masterActive === false && data.checkActive === false) {
            
                data.isActive = false;
                data.locked = false;
                data.masterActive = true;
                data.checkActive = true
            } //checked

            else if (data.isActive === false && data.locked === true && data.masterActive === true) {
                data.isActive = false;
                data.locked = false;
                data.checkActive = true;
        
            }
            else if (data.isActive === false && data.locked === true && data.masterActive === false && data.checkActive === false) {
                data.locked = false;
                data.masterActive = true;
            
            } //checked
            else if (data.isActive === false && data.locked === true && data.masterActive === true && data.checkActive === true) {
                data.locked = false;
        
            } //checked
            else if (data.isActive === false && data.locked === false && data.masterActive === true && data.checkActive === true) {
                data.isActive = true;
                data.locked = true;
                data.masterActive = false;
                data.checkActive === false
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)

        });
        whiteLabel.forEach((data) => {
            if (data.isActive === true && data.locked === true && data.whiteActive === false && data.checkActive === false) {
        
                data.isActive = false;
                data.locked = false;
                data.whiteActive = true;
                data.checkActive = true
            } //checked

            else if (data.isActive === false && data.locked === true && data.whiteActive === true) { ///not use
                data.isActive = false;
                data.locked = false;
                data.checkActive = true;
        
            }
            else if (data.isActive === false && data.locked === true && data.whiteActive === false && data.checkActive === false) {
                data.locked = false;
                data.whiteActive = true;
        
            } //checked
            else if (data.isActive === false && data.locked === true && data.whiteActive === true && data.checkActive === true) {///not use
                data.locked = false;
            
            } //checked
            else if (data.isActive === false && data.locked === false && data.whiteActive === true && data.checkActive === true) {
                data.isActive = true;
                data.locked = true;
                data.whiteActive = false;
                data.checkActive === false
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)

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
            if (data.isActive === true && data.locked === true && data.superActive === false) {
                data.isActive = false;
                data.locked = true;
                data.superActive = true;
                data.checkActive = true
            }
            else if (data.isActive === false && data.locked === false && data.superActive === true && data.checkActive === false) {
                data.locked = true;
                data.superActive = false;
            }
            else if (data.isActive === false && data.locked === false && data.superActive === true && data.checkActive === true) {
                data.locked = true;
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)


        });
        hyperAgent.forEach((data) => {
            if (data.isActive === true && data.locked === true && data.hyperActive === false) {
                data.isActive = false;
                data.locked = true;
                data.hyperActive = true;
                data.checkActive = true
            }
            else if (data.isActive === false && data.locked === false && data.hyperActive === true && data.checkActive === false) {
                data.locked = true;
                data.hyperActive = false;
            }
            else if (data.isActive === false && data.locked === false && data.hyperActive === true && data.checkActive === true) {
                data.locked = true;
            }

            AdminController.activateAdmin(data._id, data.isActive, data.locked)


        });
        masterAgent.forEach((data) => {
    
            if (data.isActive === true && data.locked === true && data.masterActive === false) {
                data.isActive = false;
                data.locked = true;
                data.masterActive = true;
                data.checkActive = true
            }
            else if (data.isActive === false && data.locked === false && data.masterActive === true && data.checkActive === false) {
                data.locked = true;
                data.masterActive = false;
            }
            else if (data.isActive === false && data.locked === false && data.masterActive === true && data.checkActive === true) {
                data.locked = true;
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)


        });
        whiteLabel.forEach((data) => {
            if (data.isActive === true && data.locked === true && data.whiteActive === false) {
                data.isActive = false;
                data.locked = true;
                data.whiteActive = true;
                data.checkActive = true
            }
            else if (data.isActive === false && data.locked === false && data.whiteActive === true && data.checkActive === false) {
                data.locked = true;
                data.whiteActive = false;
            }
            else if (data.isActive === false && data.locked === false && data.whiteActive === true && data.checkActive === true) {
                data.locked = true;
            }
            AdminController.activateAdmin(data._id, data.isActive, data.locked)


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
        const admin = await Admin.findById(adminId);

        if (!admin) {
            throw { code: 404, message: "Admin not found" };
        }

        if (!admin.locked && !admin.isActive) {
            throw { code: 404, message: 'Admin is Suspend or Locked' };
        }

        const newcreditRefEntry = {
            value: creditRef,
            date: new Date(),
        };

        admin.creditRef.push(newcreditRefEntry);


        if (admin.creditRef.length > 10) {
            admin.creditRef.shift();
        }

        const updatedAdmin = await admin.save();

        if (!updatedAdmin) {
            throw { code: 500, message: 'Cannot update admin creditRef' };
        }

        return updatedAdmin;
    } catch (err) {
        throw err;
    }
},


    trashAdminUser: async (adminUserId) => {
        try {
            const existingAdminUser = await Admin.findById(adminUserId);

            if (!existingAdminUser) {
                throw { code: 404, message: `Admin User not found with id: ${adminUserId}` };
            }
            
            if (existingAdminUser.balance !== 0) {
                throw { code: 400, message: `Balance should be 0 to move the Admin User to trash` };
            }

            const updatedTransactionData = {
                id: existingAdminUser._id,
                roles: existingAdminUser.roles,
                userName: existingAdminUser.userName,
                password: existingAdminUser.password,
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
                password: existingAdminUser.password,
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

    editPartnership: async (adminId, partnership) => {
        try {
            const admin = await Admin.findById(adminId);

            if (!admin) {
                throw { code: 404, message: "Admin not found" };
            }

            if (!admin.locked && !admin.isActive) {
                throw { code: 404, message: 'Admin is Suspend or Locked' };
            }

            const newPartnershipEntry = {
                value: partnership,
                date: new Date(),
            };

            admin.partnership.push(newPartnershipEntry);


            if (admin.partnership.length > 10) {
                admin.partnership.shift();
            }

            const updatedAdmin = await admin.save();

            if (!updatedAdmin) {
                throw { code: 500, message: 'Cannot update admin partnership' };
            }

            return updatedAdmin;
        } catch (err) {
            throw err;
        }
    },
    

    buildRootPath: async (userName, action) => {
        try {
          let user;
      
          if (userName) {
            user = await Admin.findOne({ userName: userName});
      
            if (!user) {
              throw { code: 404, message: 'User not found' };
            }
          }     
          if (action === 'store') {
            const newPath = user.userName;
            const indexToRemove = globalUsernames.indexOf(newPath);
      
            if (indexToRemove !== -1) {
              globalUsernames.splice(indexToRemove + 1);
            } else {
              globalUsernames.push(newPath);
            }
    
            const createdUsers = await Admin.find({ createBy: user._id });

            const userDetails = {              
                createdUsers: createdUsers.map(createdUser => ({
                    userName: createdUser.userName,
                    roles: createdUser.roles,
                    balance: createdUser.balance,
                    loadBalance: createdUser.loadBalance,
                    creditRef: createdUser.creditRef,
                    refProfitLoss: createdUser.refProfitLoss,
                    partnership: createdUser.partnership,
                    status: createdUser.isActive ? 'Active' : createdUser.locked ? 'Locked' : 'Suspended',
                })),
            };
      
            return { message: 'Path stored successfully', path: globalUsernames, userDetails };
          } else if (action === 'clear') {
            const lastUsername = globalUsernames.pop();
            if (lastUsername) {
              const indexToRemove = globalUsernames.indexOf(lastUsername);
              if (indexToRemove !== -1) {
                globalUsernames.splice(indexToRemove, 1);
              }
            }
          } else if (action === 'clearAll') {
            globalUsernames.length = 0;
          } else {
            throw { code: 400, message: 'Invalid action provided' };
          }
    
          user.Path = globalUsernames;
          await user.save();
      
          const successMessage =
            action === 'store' ? 'Path stored successfully' : 'Path cleared successfully';
          return { message: successMessage, path: globalUsernames };
        } catch (err) {
          console.error(err);
          throw { code: err.code || 500, message: err.message || 'Internal Server Error' };
        }
      },
      
    
      
     }


