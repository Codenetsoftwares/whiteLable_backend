import { AdminController } from "../controller/admin.controller.js";
// import { Admin } from "../models/admin.model.js";
import { Authorize } from "../middleware/auth.js";
import { SubAdminController } from "../controller/subAdmin.controller.js";


export const AdminRoute = (app) => {

    //Admin Create

    app.post("/api/admin-create", Authorize(["superAdmin","WhiteLabel", "HyperAgent", "SuperAgent", "MasterAgent"]), async (req, res) => {
        try {
            const { userName, password, roles } = req.body;
            const Admin = await AdminController.createAdmin({ userName, password, roles });
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
    
            try {
                const subAdminAccess = await SubAdminController.GenerateSubAdminAccessToken(userName, password);    
                if (subAdminAccess) {
                    return res.status(200).send({ code: 200, message: "Login Successfully", token: subAdminAccess.accessToken, role: subAdminAccess.role });
                }
            } catch (subAdminError) {
 
                console.error(subAdminError);
            }
            try {
                const accesstoken = await AdminController.GenerateAdminAccessToken(userName, password);
    
                if (accesstoken) {
                    return res.status(200).send({ code: 200, message: "Login Successfully", token: accesstoken.accessToken, role: accesstoken.role });
                }
            } catch (adminError) {

                console.error(adminError);
            }
            res.status(404).json({ code: 404, message: 'Invalid Access Token or User not authorized as Admin or Sub-Admin' });
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
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

    app.post("/api/admin/Create-user", Authorize(["superAdmin"]), async (req, res) => {
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

    // admin transfer amt to white label

    app.post("/api/admin/transfer-amount", Authorize(["superAdmin"]), async (req, res) => {
        try {
            const { adminUserName, whiteLabelUsername, trnsfAmnt } = req.body;
            const transferResult = await AdminController.transferAmountadmin(adminUserName, whiteLabelUsername, trnsfAmnt);
            console.log("transferResult", transferResult);
            res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
        }
    });



}