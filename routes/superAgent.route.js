import { SuperAgentController } from "../controller/superAgent.controller.js";
import { SuperAgent } from "../models/superAgent.model.js";



export const SuperAgentRoute = (app) => {

    app.post("/api/SuperAgent-login",async(req,res)=>
    {
        try{
        const {userName,password} = req.body;
        const admin = await SuperAgent.findOne({ userName: userName }); 
        const accesstoken = await SuperAgentController.SuperAgentLoginToken(userName, password);
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