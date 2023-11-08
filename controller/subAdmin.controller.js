import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";


export const SubAdminController = {
    
    // SubAdminLoginToken: async(userName,password) => {
    //     if (!userName) {
    //         throw { code: 400, message: 'Invalid userName' };
    //       }
    //       if (!password) {
    //         throw { code: 400, message: 'Invalid password' };
    //       }
    //       const existingSubadmin = await SubAdmin.findOne({ userName: userName });
         
    //       if (!existingSubadmin) {
    //         throw { code: 400, message: 'Invalid userName or Password' };
    //       }
    //       const isPasswordValid = await bcrypt.compare(password, existingSubadmin.password);
        
    //       if (!isPasswordValid) {
    //         throw { code: 401, message: 'Invalid userName or Password' };
    //       }
    //       const accessTokenResponse = {
    //         id: existingSubadmin._id,
    //         userName: existingSubadmin.userName,
    //       };
    //       const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
    //         expiresIn: '1d',
    //       });
    //       return {
    //         userName: existingSubadmin.userName,
    //         accessToken: accessToken,
    //       };
    //     },
}