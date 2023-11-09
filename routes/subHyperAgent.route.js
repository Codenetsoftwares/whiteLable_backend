import { SubHyperAgentController } from "../controller/subHyperAgent.controller.js";
import { Authorize } from "../middleware/auth.js";


export const SubHypergentRoute = (app) =>{

  // Hyper Agent login
    
  // app.post("/api/SubHypergent-login",async(req,res)=>
  // {
  //     try{
  //     const {userName,password} = req.body;
  //     const SubHypergent = await SubHyperAgent.findOne({ userName: userName }); 
  //     const accesstoken = await SubHyperAgentController.SubHyperAgentLoginToken(userName, password);
  //     console.log(accesstoken)
  //     console.log(SubHypergent)
  //     if (SubHypergent && accesstoken) {
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



}