import { WhiteLabelController } from "../controller/whiteLabel.controller.js";
import { AdminController } from "../controller/admin.controller.js";
import { Authorize } from "../middleware/auth.js";


export const WhiteLabelRoute = (app) => {
  
  // superAgent create evryone


  // white label Transfer Amount to hyperagent

  // app.post("/api/whitelabel/transfer-amount", Authorize(["WhiteLabel"]), async (req, res) =>
  //  {
  //   try {
  //       const { whiteLabelUsername, hyperAgentUserName, trnsfAmnt } = req.body;
  //       const transferResult = await WhiteLabelController.transferAmountWhitelabel(whiteLabelUsername, hyperAgentUserName,trnsfAmnt );
  //       console.log("transferResult", transferResult);
  //       res.status(200).send({ code: 200, message: "Transfer Amount Successfully" });
  //   } catch (err) {
  //       res.status(500).send({ code: err.code, message: err.message });
  //   }
  // });

}
