import { SuperAgentController } from "../controller/superAgent.controller.js";
import { Authorize } from "../middleware/auth.js";
import { AdminController } from "../controller/admin.controller.js";


export const SuperAgentRoute = (app) => {

    // app.post("/api/SuperAgent-login",async(req,res)=>
    // {
    //     try{
    //     const {userName,password} = req.body;
    //     const admin = await SuperAgent.findOne({ userName: userName }); 
    //     const accesstoken = await SuperAgentController.SuperAgentLoginToken(userName, password);
    //     console.log(accesstoken)
    //     if (admin && accesstoken) {
    //         res.status(200).send({code:200, message:"Login Successfully", token: accesstoken });
    //       } else {
    //         res.status(404).json({ code:404, message:'Invalid Access Token or Admin' });
    //       }
    // }
    // catch(err)
    // {
    //     res.status(500).send({code: err.code, message: err.message})
    // }
    // })
  


      
  // superAgent create evryone

//   app.post("/api/superAgent/create-users", Authorize(["SuperAgent","superAdmin"]), async(req,res) =>
//   {
//     try {
//       const { userName, password, roles } = req.body;
//       console.log(req.body)
//       const Admin = await AdminController.createAdmin({ userName, password, roles });
//       console.log(Admin)
//       res.status(200).send({ code: 200, message: `${userName} Register Successfully` })
//   }
//   catch (err) {
//       res.status(500).send({ code: err.code, message: err.message })
//   }
//   })


//  trasfer amount super agent to master agent

// app.post("/api/superAgent/transfer-amount", Authorize(["SuperAgent"]), async (req, res) => {
//     try {
//         const { superAgentUserName,masterAgentUserName,trnsfAmnt } = req.body;
//         const transferResult = await SuperAgentController. transferAmountSuperagent(superAgentUserName,masterAgentUserName, trnsfAmnt);
//         console.log("transferResult", transferResult);
//         res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
//     } catch (err) {
//         res.status(500).send({ code: err.code, message: err.message });
//     }
//   });

}