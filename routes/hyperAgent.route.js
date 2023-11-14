  import { HyperAgentController } from "../controller/hyperAgent.controller.js";
  import { Authorize } from "../middleware/auth.js";
  import { AdminController } from "../controller/admin.controller.js";


  export const HyperAgentRoute = (app) =>{

  // hyper agent create evryone

  // app.post("/api/hyperAgent/create-users", Authorize(["HyperAgent","superAdmin"]), async(req,res) =>
  // {
  //   try {
  //     const { userName, password, roles } = req.body;
  //     console.log(req.body)
  //     const Admin = await AdminController.createAdmin({ userName, password, roles });
  //     console.log(Admin)
  //     res.status(200).send({ code: 200, message: `${userName} Register Successfully` })
  // }
  // catch (err) {
  //     res.status(500).send({ code: err.code, message: err.message })
  // }
  // })

  
  // Transfer Amount to hyper agent to super agent

  // app.post("/api/hyperagent/transfer-amount", Authorize(["HyperAgent"]), async (req, res) => {
  //   try {
  //       const { hyperAgentUserName,SuperAgentUserName,trnsfAmnt } = req.body;
  //       const transferResult = await HyperAgentController.transferAmounthyperAgent(hyperAgentUserName,SuperAgentUserName,trnsfAmnt);
  //       console.log("transferResult", transferResult);
  //       res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
  //   } catch (err) {
  //       res.status(500).send({ code: err.code, message: err.message });
  //   }
  // });

  
  }