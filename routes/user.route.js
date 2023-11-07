import { UserController } from "../controller/user.controller.js";
import { User } from "../models/user.model.js";



export const UserRoute = (app) => {

    app.post("/api/User-login",async(req,res)=>
    {
        try{
        const {userName,password} = req.body;
        const admin = await User.findOne({ userName: userName }); 
        const accesstoken = await UserController.UserLoginToken(userName, password);
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