import { SubAdminController } from "../controller/subAdmin.controller.js";
import { SubAdmin } from "../models/subAdmin.model.js";



export const SubAdminRoute = (app) => {

    app.post("/api/SubAdmin-login",async(req,res)=>
    {
        try{
        const {userName,password} = req.body;
        const admin = await SubAdmin.findOne({ userName: userName }); 
        const accesstoken = await SubAdminController.SubAdminLoginToken(userName, password);
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