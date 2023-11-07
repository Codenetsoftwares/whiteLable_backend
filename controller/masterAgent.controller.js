    import bcrypt from "bcryptjs"
    import jwt from "jsonwebtoken";
    import { MasterAgent } from "../models/master.model.js";

    export const MasterAgentController = {

        MasterAgentLoginToken: async (userName, password) => {
        if (!userName) {
          throw { code: 400, message: 'Invalid userName' };
        }
        if (!password) {
          throw { code: 400, message: 'Invalid password' };
        }
        const existingMasterAgent = await MasterAgent.findOne({ userName: userName });
      
        if (!existingMasterAgent) {
          throw { code: 400, message: 'Invalid userName or Password' };
        }
        const isPasswordValid = await bcrypt.compare(password, existingMasterAgent.password);
      
        if (!isPasswordValid) {
          throw { code: 401, message: 'Invalid userName or Password' };
        }
        const accessTokenResponse = {
          id: existingMasterAgent._id,
          userName: existingMasterAgent.userName,
        };
        const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
          expiresIn: '1d',
        });
        return {
          userName: existingMasterAgent.userName,
          accessToken: accessToken,
        };
      },
    }