import { WhiteLabelController } from "../controller/whiteLabel.controller.js";
import { WhiteLabel } from "../models/whiteLabel.model.js";




export const WhiteLabelRoute = (app) => {

    app.post("/api/WhiteLabel-login",async(req,res)=>
    {
        try{
        const {userName,password} = req.body;
        const admin = await WhiteLabel.findOne({ userName: userName }); 
        const accesstoken = await WhiteLabelController.WhiteLabelLoginToken(userName, password);
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