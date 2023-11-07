import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { SuperAgent } from "../models/superAgent.model.js";


export const SuperAgentController = {
    
    SuperAgentLoginToken: async(userName,password) => {
        if (!userName) {
            throw { code: 400, message: 'Invalid userName' };
          }
          if (!password) {
            throw { code: 400, message: 'Invalid password' };
          }
          const existingSuperAgent = await SuperAgent.findOne({ userName: userName });
         
          if (!existingSuperAgent) {
            throw { code: 400, message: 'Invalid userName or Password' };
          }
          const isPasswordValid = await bcrypt.compare(password, existingSuperAgent.password);
        
          if (!isPasswordValid) {
            throw { code: 401, message: 'Invalid userName or Password' };
          }
          const accessTokenResponse = {
            id: existingSuperAgent._id,
            userName: existingSuperAgent.userName,
          };
          const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d',
          });
          return {
            userName: existingSuperAgent.userName,
            accessToken: accessToken,
          };
        },
}