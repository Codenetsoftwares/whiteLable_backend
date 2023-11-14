import { SubAdminController } from "../controller/subAdmin.controller.js";
import { Authorize } from "../middleware/auth.js";

export const SubAdminRoute = (app) => {

 //Admin Create

 app.post("/api/subadmin-create", Authorize(["superAdmin","SubWhiteLabel","SubHyperAgent","SubAdmin","SubSuperAgent","SubMasterAgent"]),
  async (req, res) => {
    try {
        const { userName, password, roles } = req.body;
        console.log(req.body)
        const subAdmin = await SubAdminController.createSubAdmin({ userName, password, roles });
        console.log(subAdmin)
        res.status(200).send({ code: 200, message: `${userName} Register Successfully` })
    }
    catch (err) {
        res.status(500).send({ code: err.code, message: err.message })
    }
})


  

}