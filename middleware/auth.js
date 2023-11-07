import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import {SubAdmin} from "../models/subAdmin.model.js"
import { HyperAgent } from "../models/hyperAgent.model.js";
import {SuperAgent} from '../models/superAgent.model.js'
import {MasterAgent} from "../models/master.model.js"
import {User} from "../models/user.model.js"
import { WhiteLabel } from "../models/whiteLabel.model.js";
export const Authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;

      if (!authToken || !authToken.startsWith("Bearer ")) {
        throw { status: 401, message: "Invalid token format" };
      }

      const token = authToken.split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

      if (!user) {
        throw { status: 401, message: "Invalid token" };
      }

      let existingUser;

      if (roles.includes("superAdmin")) {
        existingUser = await Admin.findById(user.id).exec();
      } 
      else if (roles.includes("subadmin")) {
        existingUser = await SubAdmin.findById(user.id).exec();
      } 
      if (roles.includes("whiteLabel")) {
        existingUser = await WhiteLabel.findById(user.id).exec();
      } 
      else if (roles.includes("hyperAgent")) {
        existingUser = await HyperAgent.findById(user.id).exec();
      } 
      else if (roles.includes("superAgent")) {
        existingUser = await SuperAgent.findById(user.id).exec();
      } 
      else if (roles.includes("masterAgent")) {
        existingUser = await MasterAgent.findById(user.id).exec();
      }
      else if (roles.includes("user")) {
        existingUser = await User.findById(user.id).exec();
      }

      if (!existingUser) {
        throw { status: 403, message: "Unauthorized access" };
      }

      req.user = existingUser;
      next();
    } catch (error) {
      console.error("Authorization Error:", error.message);
      return res.status(error.status || 500).send({ code: error.status || 500, message: error.message });
    }
  };
}