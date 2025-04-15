import { PrismaClient, PlatformEnum } from "@prisma/client";
import jwt from "jsonwebtoken";
import { SALT_ROUNDS, JWT_SECRET } from "./config.js";
import bcrypt from "bcrypt";
import { CodeChefPlatform } from "./svc/codechef.js"
import { CodeforcesPlatform } from "./svc/codeforces.js"

export const db = new PrismaClient({
  log: [{ level: "query", emit: "event" }],
});
export function getPlatfromEnumValue(name){
    switch(name){
        case "codeforces":
            return PlatformEnum.codeforces
        case "codechef":
            return PlatformEnum.codechef
        default:
            return null
    }
}

export async function sleep(seconds=null){
  if(seconds==null){
    seconds=(Math.floor(Math.random() * 10) + 5)
  }
  return new Promise((resolve)=> setTimeout(resolve, 1000 * seconds));
}
export async function getPlatformByName(name, user=null){
    const platform = await db.platform.findMany({
            where: {
                userId: user?.id,
                platform: getPlatfromEnumValue(name),
                isValid: true
            }
        })
    console.log(platform) 
    switch(name){
        case "codeforces":
            return new CodeforcesPlatform(user,platform)
        case "codechef":
            return new CodeChefPlatform(user,platform)
        default:
            return null
    }
}

export function hashPassword(password) {
  if (!password) {
    throw new Error("Password cannot be null or empty");
  }
  try {
    const salt = bcrypt.genSaltSync(SALT_ROUNDS);
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
}

export function checkPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    throw new Error("Password or hashed password is empty");
  }
  return bcrypt.compareSync(password, hashedPassword);
}

//TODO: Planning to use RSA in case of microservices based architecture
export function generateJWTToken(user) {
  if (!user) {
    throw new Error("User cannot be null or undefined");
  }
  if (!user.id || !user.email) {
    throw new Error("User must have id and email attributes");
  }
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "3d",
      },
    );
  } catch (error) {
    console.error(error);
    throw new Error("Error generating JWT token: " + error.message);
  }
}

export function verifyJWTToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return null;
    }
    console.error(error);
    throw error;
  }
}



export function checkDurability(password){
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

//TODO: nodemailer needs to configured here