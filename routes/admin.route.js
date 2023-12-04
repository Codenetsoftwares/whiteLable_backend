import { AdminController } from "../controller/admin.controller.js";
import { Admin } from "../models/admin.model.js";
import { Authorize } from "../middleware/auth.js";
import { WhiteLabelController } from "../controller/whiteLabel.controller.js";
import { HyperAgentController } from "../controller/hyperAgent.controller.js";
import { SuperAgentController } from "../controller/superAgent.controller.js";
import { Trash } from "../models/trash.model.js";
import axios from "axios";



export const AdminRoute = (app) => {

    //Admin Create

    app.post("/api/admin-create", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const user = req.user;
            await AdminController.createAdmin(req.body, user);
            res.status(200).send({ code: 200, message: 'Admin registered successfully!' })
        }
        catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }
    })


    // admin login

    app.post("/api/admin-login", async (req, res) => {
        try {
            console.log('req', req.ip);
            const { userName, password } = req.body;
            const admin = await Admin.findOne({ userName: userName });
            const accesstoken = await AdminController.GenerateAdminAccessToken(userName, password);
            const loginTime = new Date();
            const ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress || ' ';
            console.log(`Client IP address: ${ipAddress}`);
            console.log('first')
            const ipinfoResponse = await axios.get(`http://ipinfo.io/${ipAddress}?token=377a39a48cae33`);
            console.log('second')
            console.log('ipinfo', ipinfoResponse);

            const location = ipinfoResponse.data;
            const user = { accesstoken, loginTime, ipAddress, location };
            console.log('third')
            if (admin && accesstoken) {                
                res.status(200).send({ code: 200, message: "Login Successfully", token: user });
            } else {
                res.status(404).json({ code: 404, message: 'Invalid Access Token or Admin' });
            }
        } catch (err) {
            console.error('Error:', err.message);
            res.status(err.response?.status || 500).send({ code: err.code, message: err.message });
        }
    });
    
    
    // reset password

    app.post( "/api/admin/reset-password", async (req, res) => {
          try {
            const { userName, oldPassword, password } = req.body;
            await AdminController.PasswordResetCode(userName, oldPassword, password);
            res.status(200).send({ code: 200, message: "Password reset successful!" });
          }  catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }
        }
      );

    // create User

    app.post("/api/admin/Create-user", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            
            const { userName, password } = req.body;
            const user = await AdminController.CreateUser({ userName, password });
            console.log(user)
            res.status(200).send({ code: 200, message: "User Register Successfully" })
        }
        catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }
    })

    // deposit amt

    app.post("/api/admin/deposit-amount/:adminId", Authorize(["superAdmin"]), async (req, res) => {
        try {
            const adminId = req.params.adminId
            const { depositeAmount } = req.body
            const amount = await AdminController.Deposit(adminId, depositeAmount)
            console.log("amount", amount)
            res.status(200).send({ code: 200, message: "Deposite Amount Successfully" })
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }

    })

    // transfer Amount

    app.post("/api/transfer-amount", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent"]), async (req, res) => {
        try {
            const { adminUserName, whiteLabelUsername, hyperAgentUserName,  SuperAgentUserName, masterAgentUserName, trnsfAmnt,remarks } = req.body;
    
            let transferResult;
    
            if (adminUserName && whiteLabelUsername) {

                transferResult = await AdminController.transferAmountadmin(adminUserName, whiteLabelUsername, trnsfAmnt,remarks);


            } 
            else if (whiteLabelUsername  &&  hyperAgentUserName) {
              
                transferResult = await WhiteLabelController.transferAmountWhitelabel(whiteLabelUsername, hyperAgentUserName, trnsfAmnt,remarks);

            }
            else if (hyperAgentUserName && SuperAgentUserName) {
                
                transferResult = await HyperAgentController.transferAmounthyperAgent(hyperAgentUserName,SuperAgentUserName,trnsfAmnt,remarks);

            }
            else if (SuperAgentUserName && masterAgentUserName) {
                
                transferResult = await SuperAgentController.transferAmountSuperagent(SuperAgentUserName, masterAgentUserName, trnsfAmnt,remarks);

            }       
        //    else if (!transferResult.isActive) {
        //         throw { code: 404, message: 'Admin is inactive' };
        //     }
  
             else {
                throw { code: 400, message: "Invalid transfer details provided" };
            }
    
            console.log("transferResult", transferResult);

            res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });

        } catch (err) {
            const statusCode = err.code || 500;
            res.status(statusCode).send({ code: err.code, message: err.message });
        }
    });

    // view transaction details

    // app.get("/api/transaction-view/:id", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent","MasterAgent"]),async (req, res) => {
    //     try {
    //         const id = req.params.id;
    //         const admin = await Admin.findById(id);
    //         console.log("bal", admin.balance)
    //         let balances = 0;
    //         if (!admin) {
    //             return res.status(404).json({ message: "User not found" });
    //         }
            
    //         const transferData = admin.transferAmount.map((transfer) => {
    //             return {   
    //                 userId: admin.id,
    //                 From : admin.userName,
    //                 transferAmount: transfer.amount,
    //                 To: transfer.userName,
    //                 date: transfer.date,
    //                 transactionType: transfer.transactionType,
    //             };
    //         });
    //         transferData.sort((a, b) => {
    //             const dateA = new Date(a.date);
    //             const dateB = new Date(b.date);
    //             return dateB - dateA;
    //           });
    //         let allData = JSON.parse(JSON.stringify(transferData));
    //         allData.slice(0).reverse().map((data) => {
                // if(data.transactionType === "Debit"){
                //     admin.balance -= data.transferAmount;
                //     data.balance = admin.balance;
                //     console.log("bal2", data.balance)
                // }
                // if(data.transactionType === "Credit"){
                //     balances += data.transferAmount;
                //     data.balance = balances;
                // }
    //         });
    //         res.status(200).json(allData);
    //     } catch (err) {
    //         res.status(500).json({ code: err.code, message: err.message });
    //     }
    // });

    app.get("/api/transaction-view/:id", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const id = req.params.id;
            let balances = 0;
            let debitBalances = 0
            const admin = await Admin.findById(id).exec();
    
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }
    
            const transactionData = admin.transferAmount;
    
            // transactionData.sort((a, b) => {
            //     const dateA = new Date(a.date);
            //     const dateB = new Date(b.date);
            //     return dateA - dateB;
            // });

            transactionData.sort((a, b) => new Date(a.date) - new Date(b.date));

            let allData = JSON.parse(JSON.stringify(transactionData));
    
            allData.slice(0).reverse().map((data) => {
                if (data.transactionType === "Credit") {
                    balances += data.amount;
                    data.balance = balances;
                }
                if (data.transactionType === "Debit") {
                    debitBalances += data.amount;
                    data.debitBalance = debitBalances;
                }
            });
     
            res.status(200).json(allData);
        } catch (err) {
            res.status(500).json({ code: err.code, message: err.message });
        }
    });
    
    
// view creates

    app.get("/api/view-all-creates/:createdBy",Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent","MasterAgent"]), async (req, res) => {
        try {
            const createdBy = req.params.createdBy;
    
            const admin = await Admin.find({ createBy: createdBy });
    
            if (!admin) {
                return res.status(404).send({ code: 404, message: `Not Found` });
            }
            const user = admin.map((users) => {
                return {
                    id : users.id , 
                    userName: users.userName,
                    roles : users.roles,    
                    balance : users.balance,
                    loadBalance : users.loadBalance,
                    creditRef : users.creditRef,
                    refProfitLoss : users.refProfitLoss,                 
                    
                };
            })  
            res.status(200).send({ user });
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
        }
    });

    


    // view balance

    app.get("/api/view-balance/:id", async (req, res) => {
        try {
            const id = req.params.id;
            
            const admin = await Admin.findById(id);
    
            if (!admin) {
                return res.status(404).send({ code: 404, message: `Not Found` });
            }
    
            const amount = {
                balance: admin.balance
            };
    
            res.status(200).send({ amount });
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
        }
    });

    // active status

    app.post("/api/activate/:adminId", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const isActive = req.body.isActive;
        const locked = req.body.locked;
        const result = await AdminController.activateAdmin(adminId, isActive, locked);

        if (result) {
            res.status(200).send(result);
        } else {
            res.status(result.code).send(result);
        }
    } catch (err) {
        console.error("message", err.message);
        res.status(500).send({ code: err.code, message: err.message });
    }
});



      app.put("/api/admin/update-credit-ref/:adminId", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const adminId = req.params.adminId;
            const { creditRef } = req.body;   
            const updatedAdmin = await AdminController.editCreditRef(adminId, creditRef);       
            res.json(updatedAdmin);
        } catch (err) {
            // console.error(err.message);
            res.status(500).json({ err: err.message });
        }
    });
   
  //  Move To Trash 

    app.post("/api/admin/move-to-trash-user", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
          const { requestId } = req.body;
          const adminUser = await Admin.findById(requestId);
          if (!adminUser) {
            return res.status(404).send("Admin User not found");
          }
          console.log("Admin User not found", adminUser);
          const updateResult = await AdminController.trashAdminUser(adminUser);
          console.log(updateResult);
          if (updateResult) {
            res.status(201).send("Admin User Moved To Trash");
          }
        } catch (e) {
          console.error(e);
          res.status(e.code).send({ message: e.message });
        }
      });

    //   View Trash Data

      app.get("/api/admin/view-trash",Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
          try {
            const resultArray = await Trash.find().exec();
            res.status(200).send(resultArray);
          } catch (error) {
            console.log(error);
            res.status(500).send("Internal Server error");
          }
        }
      );

    //   Delete From Trash

      app.delete("/api/delete/admin-user/:id", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
          const id = req.params.id;
          const result = await Trash.deleteOne({ _id: id });
          if (result.deletedCount === 1) {
            res.status(200).send({ message: "Data deleted successfully" });
          } else {
            res.status(404).send({ message: "Data not found" });
          }
        } catch (e) {
          console.error(e);
          res.status(500).send({ message: e.message });
        }
      });

    //   View Active Locked Status

      app.get("/api/admin/active-status/:adminId", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const adminId = req.params.adminId
            const activateStatus = await Admin.findById(adminId).exec();
            if (!activateStatus) {
                return res.status(404).send({ code: 404, message: `Admin Not Found` });
            }
    
            const active = {
                id: activateStatus.id,
                isActive: activateStatus.isActive,
                locked: activateStatus.locked
            };
    
            res.status(200).send(active);
        } catch (err) {
            console.log(err);
            res.status(500).send({ code: err.code, message: err.message });
        }
    });
    
     //   Restore Transh Data

    app.post("/api/admin/restore-to-wallet-user", Authorize(["superAdmin", "WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
          const { userId } = req.body;      
          const restoreResult = await AdminController.restoreUser(userId); 
          if (restoreResult) {
            res.status(201).send("Admin User Moved To Wallet");
          } else {          
            res.status(500).send("Failed to restore Admin User to Wallet");
          }
        } catch (err) {
          res.status(500).send({ message: err.message});
        }
      });

    //   View User Profile

      app.get("/api/User-Profile-view/:id", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent","MasterAgent"]),async (req, res) => {
            try {
                const id = req.params.id;
                const admin = await Admin.findById(id);
               
                const transferData =  {           
                        userId: admin.id,
                        Roles : admin.roles,
                        userName: admin.userName,                     
                    
                };
                res.status(200).json(transferData);
            } catch (err) {
                res.status(500).json({ code: err.code, message: err.message });
            }
        });
    }