import { MasterAgentController } from "../controller/masterAgent.controller.js";
import { AdminController } from "../controller/admin.controller.js";
import { Authorize } from "../middleware/auth.js";


export const MasterAgentRoute = (app) =>{

  // Hyper Agent login
    
  // app.post("/api/MasterAgent-login",async(req,res)=>
  // {
  //     try{
  //     const {userName,password} = req.body;
  //     const admin = await MasterAgent.findOne({ userName: userName }); 
  //     const accesstoken = await MasterAgentController.MasterAgentLoginToken(userName, password);
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



  // masterAgent create evryone

  app.post("/api/masterAgent/create-users", Authorize(["MasterAgent","superAdmin"]), async(req,res) =>
  {
    try {
      const { userName, password, roles } = req.body;
      console.log(req.body)
      const Admin = await AdminController.createAdmin({ userName, password, roles });
      console.log(Admin)
      res.status(200).send({ code: 200, message: `${userName} Register Successfully` })
  }
  catch (err) {
      res.status(500).send({ code: err.code, message: err.message })
  }
  })


}