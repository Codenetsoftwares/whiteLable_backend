import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";

export const HyperAgentController = {

// hyperAgentLoginToken: async (userName, password) => {
//     if (!userName) {
//       throw { code: 400, message: 'Invalid userName' };
//     }
//     if (!password) {
//       throw { code: 400, message: 'Invalid password' };
//     }
//     const existinghyperAgent = await HyperAgent.findOne({ userName: userName });
   
//     if (!existinghyperAgent) {
//       throw { code: 400, message: 'Invalid userName or Password' };
//     }
//     const isPasswordValid = await bcrypt.compare(password, existinghyperAgent.password);
  
//     if (!isPasswordValid) {
//       throw { code: 401, message: 'Invalid userName or Password' };
//     }
//     const accessTokenResponse = {
//       id: existinghyperAgent._id,
//       userName: existinghyperAgent.userName,
//     };
//     const accessToken = jwt.sign(accessTokenResponse, process.env.JWT_SECRET_KEY, {
//       expiresIn: '1d',
//     });
//     return {
//       userName: existinghyperAgent.userName,
//       accessToken: accessToken,
//     };
//   },


//   transferAmount: async (SuperAgentUserName,hyperAgentUserName, trnsfAmnt) => {
//     try {
//         const hyperAgent = await HyperAgent.findOne({ userName: hyperAgentUserName }).exec();

//         if (!hyperAgent) {
//             throw { code: 404, message: "HyperAgent Not Found For Transfer" };
//         }

//         const superAgent = await SuperAgent.findOne({ userName: SuperAgentUserName }).exec();

//         if (!superAgent) {
//             throw { code: 404, message: "Super Agent Not Found" };
//         }

//         if (hyperAgent.balance < trnsfAmnt) {
//             throw { code: 400, message: "Insufficient balance for the transfer" };
//         }
        
//         hyperAgent.balance -= trnsfAmnt;
//         superAgent.balance += trnsfAmnt;
//         hyperAgent.transferAmount += trnsfAmnt;

//         await hyperAgent.save();
//         await superAgent.save();
//         return { message: "Balance Transfer Successfully" };
//       } catch (err) {
//         throw { code: err.code, message: err.message };
//       }
// },



// createSubHyperAgent: async(data) => {
//   const existingSubHyperAgent = await SubHyperAgent.findOne({userName: data.userName})
//   console.log(existingSubHyperAgent)
//   if(existingSubHyperAgent)
//   {
//       throw({code:409, message:"SubHyper Agent Already Exist"})
//   }
//   if(!data.userName)
//   {
//       throw({message:"userName Is Required" })
//   }
//   if(!data.password)
//   {
//       throw({message:"Password Is Required"})
//   }
//   const Passwordsalt = await bcrypt.genSalt();
//   const encryptedPassword = await bcrypt.hash(data.password, Passwordsalt);
//   const newSubHyperAgent = new SubHyperAgent({
//           userName: data.userName,
//           password: encryptedPassword,
//       });
//       console.log(newSubHyperAgent)
//       newSubHyperAgent.save().catch((err) => {
//           console.error(err);
//           throw { code: 500, message: "Failed to save user" };
//       });

// },

}