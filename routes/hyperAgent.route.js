  import { HyperAgentController } from "../controller/hyperAgent.controller.js";
  import { Authorize } from "../middleware/auth.js";


  export const HyperAgentRoute = (app) =>{

  // Hyper Agent login
    
  // app.post("/api/HyperAgent-login",async(req,res)=>
  // {
  //     try{
  //     const {userName,password} = req.body;
  //     const admin = await HyperAgent.findOne({ userName: userName }); 
  //     const accesstoken = await HyperAgentController.hyperAgentLoginToken(userName, password);
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

  // hyperAgent Transfer Amount

  app.post("/api/hyperagent/transfer-amount", Authorize(["hyperAgent"]), async (req, res) => {
    try {
        const { SuperAgentUserName,hyperAgentUserName, trnsfAmnt } = req.body;
        const transferResult = await HyperAgentController.transferAmount(SuperAgentUserName,hyperAgentUserName, trnsfAmnt);
        console.log("transferResult", transferResult);
        res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
    } catch (err) {
        res.status(500).send({ code: err.code, message: err.message });
    }
  });


  // Sub Hyper Agent Create
    
  app.post("/api/hyperagent/SubHyperAgent-create",Authorize(["hyperAgent"]),async(req,res)=>
  {
    try{
    const {userName,email,password} = req.body;
    console.log(req.body)
    const subHyperAgent = await HyperAgentController.createSubHyperAgent({userName,email,password});
        console.log(subHyperAgent)
        res.status(200).send({code:200, message:"User Save Successfully"})  
  }
  catch(err)
  {
    res.status(500).send({code: err.code, message: err.message})
  }
  })

  }