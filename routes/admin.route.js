import { AdminController } from "../controller/admin.controller.js";
import { Admin } from "../models/admin.model.js";
import { Authorize } from "../middleware/auth.js";


export const AdminRoute = (app) => {

    //Admin Create

    app.post("/api/admin-create", Authorize(["superAdmin"]), async (req, res) => {
        try {
            const { userName, password, roles } = req.body;
            console.log(req.body)
            const Admin = await AdminController.createAdmin({ userName, password, roles });
            console.log(Admin)
            res.status(200).send({ code: 200, message: "Admin Register Successfully" })
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

    // sub admin Create
    // app.post("/api/admin/Create-SubAdmin", Authorize(["superAdmin"]), async (req, res) => {
    //     try {
    //         const { userName, password, roles } = req.body;
    //         const Subadmin = await AdminController.CreateSubAdmin({ userName, password });
    //         console.log(Subadmin)
    //         res.status(200).send({ code: 200, message: "Sub Admin Register Successfully" })
    //     }
    //     catch (err) {
    //         res.status(500).send({ code: err.code, message: err.message })
    //     }
    // })

    // create white label
    // app.post("/api/admin/Create-whiteLabel", Authorize(["superAdmin"]), async (req, res) => {
    //     try {
    //         const { userName, password } = req.body;
    //         const whiteLabel = await AdminController.CreateWhiteLabel({ userName, password });
    //         console.log(whiteLabel)
    //         res.status(200).send({ code: 200, message: "whiteLabel Register Successfully" })
    //     }
    //     catch (err) {
    //         res.status(500).send({ code: err.code, message: err.message })
    //     }
    // })

    // create Hyper Agent
    // app.post("/api/admin/Create-HyperAgent", Authorize(["superAdmin"]), async (req, res) => {
    //     try {
    //         const { userName, password } = req.body;
    //         const HyperAgent = await AdminController.CreateHyperAgent({ userName, password });
    //         console.log(HyperAgent)
    //         res.status(200).send({ code: 200, message: "HyperAgent Register Successfully" })
    //     }
    //     catch (err) {
    //         res.status(500).send({ code: err.code, message: err.message })
    //     }
    // })

    // create super Agent
    // app.post("/api/admin/Create-SuperAgent", Authorize(["superAdmin"]), async (req, res) => {
    //     try {
    //         const { userName, password } = req.body;
    //         const SuperAgent = await AdminController.CreateSuperAgent({ userName, password });
    //         console.log(SuperAgent)
    //         res.status(200).send({ code: 200, message: "Super Agent Register Successfully" })
    //     }
    //     catch (err) {
    //         res.status(500).send({ code: err.code, message: err.message })
    //     }
    // })

    // create Master Agent
    // app.post("/api/admin/Create-MasterAgent", Authorize(["superAdmin"]), async (req, res) => {
    //     try {
    //         const { userName, password } = req.body;
    //         const MasterAgent = await AdminController.CreateMasterAgent({ userName, password });
    //         console.log(MasterAgent)
    //         res.status(200).send({ code: 200, message: "Master Agent Register Successfully" })
    //     }
    //     catch (err) {
    //         res.status(500).send({ code: err.code, message: err.message })
    //     }
    // })


    // create Master Agent

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


    // deposit amt


    app.post("/api/admin/transfer-amount", Authorize(["superAdmin"]), async (req, res) => {
        try {
            const { adminUserName, hyperAgentUserName, trnsfAmnt } = req.body;
            const transferResult = await AdminController.transferAmount(adminUserName, hyperAgentUserName, trnsfAmnt);
            console.log("transferResult", transferResult);
            res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
        } catch (err) {
            res.status(500).send({ code: err.code, message: err.message });
        }
    });



}