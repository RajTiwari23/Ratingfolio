import { db, hashPassword, generateJWTToken, checkPassword, checkDurability } from "../utils.js";

//TODO: Add logging using any library
export async function LoginController(req, res) {
  try {
    const body = req.body;
    if (!body.password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }
    if (!body.email) {
      return res.status(400).json({
        message: "email is required",
      });
    }
    const user = await db.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist, please register",
      });
    }
    if(!user.verified ){
      return res.status(403).json({
        message:"User is not verified."
      })
    }
    const credentials = await db.authCredential.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (!credentials) {
      return res.status(400).json({
        message: "User does not exist, please register",
      });
    }
    if (!checkPassword(body.password, credentials.password)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const token = generateJWTToken(user);
    return res.status(200).json({
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong, please try again",
    });
  }
}

export async function RegisterController(req, res) {
  try {
    await db.$transaction(async (tx) => {
      const body = req.body;
      if (!body.password) {
        return res.status(400).json({
          message: "Password is required",
        });
      }
      if (!body.email) {
        return res.status(400).json({
          message: "email is required",
        });
      }
      if(!body.username){
        return res.status(400).json({
          message: "username is required"
        })
      }
      let user = await tx.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (user) throw new Error("User already exists");
      if (!checkDurability(body.password)){
        throw new Error("Password is not strong enough")
      }
      if(body.username.toLowerCase()==="search") throw new Error("Forbidden Username")
      user = await tx.user.create({
        data: {
          username:body.username,
          email: body.email,
          name: body.name,
          verified: true,
        },
      });
      const hashedPassword = hashPassword(body.password);
      await tx.authCredential.create({
        data: {
          password: hashedPassword,
          userId: user.id,
        },
      });
      const otp = Math.floor(Math.random()*100000 + 90000);
      await tx.resetPasswordToken.create({
        data: {
          otp:otp,
          userId:user.id
        }
      })
      // fireVerifyOtp(user.email, otp);
      return user;
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function VerifyOtpController(req, res){
  try{
    const body = req.body;
    if(!body.otp){
      return res.status(400).json({
        message: "Otp is required",
      });
    }
    body.otp = parseInt(body.otp)
    const user = await db.resetPasswordToken.findUnique({
      where:{
        otp:body.otp
      },
      select:{
        user:{
          select:{
            id:true,
            email:true,
          }
        }
      }
    })
    if (!user) {
      return res.status(400).json({
        message: "User does not exist, please register",
      });
    }
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where:{
          id:user.user.id
        },
        data:{
          verified:true
        }
      })
      await tx.resetPasswordToken.delete({
        where:{
          otp:body.otp
        }
      })
    })
    const token = generateJWTToken(user);
    return res.status(200).json({
      token: token,
    });
  }catch(error){
    console.error(error);
  }
}

export async function ChangePasswordController(req, res){
  try{
    const body = req.body;
    if(!body.password){
      return res.status(400).json({
        message: "Password is required",
      });
    }
      if (!checkDurability(body.password)){
        return res.status(400).json({"message":"Password is not strong enough"})
      }
    const user = req.user;
    const hashedPassword = hashPassword(body.password);
    await db.authCredential.update({
      where:{
        userId:user.id
      },
      data:{
        password:hashedPassword
      }
    })
    return res.status(200).json({
      message:"Password changed successfully"
    })
  }catch(error){
    console.error(error)
    return res.status(500).json({
      message:"Internal Server Error"
    })
  }
}

export async function ResetPasswordController(req, res){
  try{
    const body = req.body;
    if(!body.email){
      return res.status(400).json({
        message:"Email is required"
      })
    }
    const user = await db.user.findUnique({
      where:{
        email:body.email
      }
    })
    if(!user){
      return res.status(400).json({
        message:"User does not exist"
      })
    }
    const otp = Math.floor(Math.random()*100000 + 90000);
    await db.resetPasswordToken.create({
      data: {
        otp:otp,
        userId:user.id
      }
    })
    fireResetPasswordOtp(user.email, otp);
    return res.status(200).json({
      message:"Otp sent successfully"
    })
  }catch(error){
    console.error(error)
    return res.status(500).json({
      message:"Internal Server Error"
    })
  }
}