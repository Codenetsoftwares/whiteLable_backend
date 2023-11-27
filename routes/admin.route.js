import { AdminController } from "../controller/admin.controller.js";
import { Admin } from "../models/admin.model.js";
import { Authorize } from "../middleware/auth.js";
import { WhiteLabelController } from "../controller/whiteLabel.controller.js";
import { HyperAgentController } from "../controller/hyperAgent.controller.js";
import { SuperAgentController } from "../controller/superAgent.controller.js";



export const AdminRoute = (app) => {

    //Admin Create

    app.post("/api/admin-create", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const { userName, password, roles } = req.body;
            const createdBy = req.user.id;
            const isActived = req.body.isActive;
            const Admin = await AdminController.createAdmin({ userName, password, roles, createBy : createdBy, isActive:isActived });
            console.log(Admin)
            res.status(200).send({ code: 200, message: `${userName} Register Successfully` })
        }
        catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }
    })


    // admin login

    app.post("/api/admin-login", async (req, res) => {
        try {
            const { userName, password } = req.body;
            const admin = await Admin.findOne({ userName: userName });
            const accesstoken = await AdminController.GenerateAdminAccessToken(userName, password);
            console.log(accesstoken)
            if (admin && accesstoken) {
                res.status(200).send({ code: 200, message: "Login Successfully", token: accesstoken });
            } else {
                res.status(404).json({ code: 404, message: 'Invalid Access Token or Admin' });
            }
        }
        catch (err) {
            res.status(500).send({ code: err.code, message: err.message })
        }
    })
    
    
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
            const { adminUserName, whiteLabelUsername, hyperAgentUserName,  SuperAgentUserName, masterAgentUserName, trnsfAmnt } = req.body;
    
            let transferResult;
    
            if (adminUserName && whiteLabelUsername) {

                transferResult = await AdminController.transferAmountadmin(adminUserName, whiteLabelUsername, trnsfAmnt);

            } 
            else if (whiteLabelUsername  &&  hyperAgentUserName) {
              
                transferResult = await WhiteLabelController.transferAmountWhitelabel(whiteLabelUsername, hyperAgentUserName, trnsfAmnt);

            }
            else if (hyperAgentUserName && SuperAgentUserName) {
                
                transferResult = await HyperAgentController.transferAmounthyperAgent(hyperAgentUserName,SuperAgentUserName,trnsfAmnt);

            }
            else if (SuperAgentUserName && masterAgentUserName) {
                
                transferResult = await SuperAgentController.transferAmountSuperagent(SuperAgentUserName, masterAgentUserName, trnsfAmnt);

            }         
             else {
                throw { code: 400, message: "Invalid transfer details provided" };
            }
    
            console.log("transferResult", transferResult);

            res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });

        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
        }
    });

    // view transaction details

    app.get("/api/transaction-view/:id", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent","MasterAgent"]),async (req, res) => {
        try {
            const id = req.params.id;
            const admin = await Admin.findById(id);
    
            if (!admin) {
                return res.status(404).json({ message: "User not found" });
            }
            
            const transferData = admin.transferAmount.map((transfer) => {
                return {   
                    userId: admin.id,
                    transferAmount: transfer.amount,
                    userName: transfer.userName,
                    date: transfer.date,
                    transactionType: transfer.transactionType
                };
            });
            // res.status(200).json(user);
            res.status(200).json(transferData);
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

    app.post("/api/activate/:adminId", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]),async (req, res) => {
        try {
            const adminId = req.params.adminId;
            const isActive = req.body.isActive;
            const locked = req.body.locked;
            const result = await AdminController.activateAdmin(adminId, isActive,locked);
          if (result.success) {
            res.status(200).send(result);
          } else {
            res.status(404).send(result);
          }
        } catch (err) {
          console.error(err);
          res.status(500).send({ code: err.code, message: err.message });
        }
      });


      app.put("/api/admin/update-credit-ref/:adminId", async (req, res) => {
        try {
            const adminId = req.params.adminId;
            const { creditRef } = req.body;   
            const updatedAdmin = await AdminController.editCreditRef(adminId, creditRef);

            res.json(updatedAdmin);
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

}