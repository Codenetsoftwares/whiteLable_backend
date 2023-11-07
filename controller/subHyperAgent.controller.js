import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { SubHyperAgent } from "../models/subHyperAgent.model.js";


export const SubHyperAgentController = {

    SubHyperAgentLoginToken: async (userName, password) => {
    if (!userName) {
      throw { code: 400, message: 'Invalid userName' };
    }
    if (!password) {
      throw { code: 400, message: 'Invalid password' };
    }
    const existingSubHyperAgent = await SubHyperAgent.findOne({ userName: userName });
  
    if (!existingSubHyperAgent) {
      throw { code: 400, message: 'Invalid userName or Password' };
    }
    const isPasswordValid = await bcrypt.compare(password, existingSubHyperAgent.password);
  
    if (!isPasswordValid) {
      throw { code: 401, message: 'Invalid userName or Password' };
    }
    const accessTokenResponse = {
      id: existingSubHyperAgent._id,
      userName: existingSubHyperAgent.userName,
    };
    const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });
    return {
      userName: existingSubHyperAgent.userName,
      accessToken: accessToken,
    };
  },
}