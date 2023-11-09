import { WhiteLabelController } from "../controller/whiteLabel.controller.js";
import { AdminController } from "../controller/admin.controller.js";
import { Authorize } from "../middleware/auth.js";


export const WhiteLabelRoute = (app) => {

    // app.post("/api/WhiteLabel-login",async(req,res)=>
    // {
    //     try{
    //     const {userName,password} = req.body;
    //     const admin = await WhiteLabel.findOne({ userName: userName }); 
    //     const accesstoken = await WhiteLabelController.WhiteLabelLoginToken(userName, password);
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

  app.post("/api/whiteLabel/create-users", Authorize(["WhiteLabel","superAdmin"]), async(req,res) =>
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


  // white label Transfer Amount to hyperagent

  app.post("/api/whitelabel/transfer-amount", Authorize(["WhiteLabel"]), async (req, res) =>
   {
    try {
        const { whiteLabelUsername, hyperAgentUserName, amount } = req.body;
        const transferResult = await WhiteLabelController.transferAmountWhitelabel(whiteLabelUsername, hyperAgentUserName, amount, req.body);
        console.log("transferResult", transferResult);
        res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
    } catch (err) {
        res.status(500).send({ code: err.code, message: err.message });
    }
  });

}