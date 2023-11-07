import { MasterAgent } from "../models/master.model.js";
import { MasterAgentController } from "../controller/masterAgent.controller.js";


export const MasterAgentRoute = (app) =>{

  // Hyper Agent login
    
  app.post("/api/MasterAgent-login",async(req,res)=>
  {
      try{
      const {userName,password} = req.body;
      const admin = await MasterAgent.findOne({ userName: userName }); 
      const accesstoken = await MasterAgentController.MasterAgentLoginToken(userName, password);
      console.log(accesstoken)
      if (admin && accesstoken) {
          res.status(200).send({code:200, message:"Login Successfully", token: accesstoken });
        } else {
          res.status(404).json({ code:404, message:'Invalid Access Token or Admin' });
        }
  }
  catch(err)
  {
      res.status(500).send({code: err.code, message: err.message})
  }
  })


}