import { PlatformEnum, StateEnum } from "@prisma/client";
import { db, getPlatformByName } from "../utils.js";
import {extractUserInfo} from "../tasks.js"
import moment from "moment";

export async function patchProfileController(req, res) {
  try {
    const body = req.body;
    await db.$transaction(async (tx) => {
      if (body.name || body.email) {
        await tx.user.update({
          where: {
            id: req.user.id,
          },
          data: {
            name: body.name,
            email: body.email,
            updatedAt: new Date(),
          },
        });
      }
      if (body.bio) {
        await tx.profile.update({
          where: {
            id: parseInt(req.params.profile_id),
            userId: req.user.id,
          },
          data: {
            bio: body.bio,
            updatedAt: new Date(),
          },
        });
      }
    });
    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getProfileController(req, res) {
  try {
    const profile = await db.profile.findFirst({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
        bio: true,
        rating: true,
        user: {
          select: {
            username:true,
            id: true,
            name: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function postProfileController(req, res) {
  try {
    const body = req.body;
    const profile = await db.profile.findFirst({
      where: {
        userId: req.user.id,
      },
    });
    if (profile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }
    await db.profile.create({
      data: {
        userId: req.user.id,
        bio: body.bio,
      },
    });
    return res
      .status(201)
      .json({ message: "Profile has been successfully created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getMinimalPlatformController(req, res) {
  try {
    const platforms = await db.platform.findMany({
      where: {
        userId: req.user.id,
      },
      select: {
        id: true,
        username: true,
        platform: true,
        rating: true,
        isValid:true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(platforms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getDetailPlatformController(req, res) {
  try {
    const platform = await db.platform.findUnique({
      where: {
        id: parseInt(req.params.platform_id),
        userId: req.user.id,
      },
      select: {
        id: true,
        username: true,
        platform: true,
        rating: true,
        maxRating: true,
        maxTitle: true,
        title: true,
        country: true,
        isValid: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(platform);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function postPlatformController(req, res) {
  try {
    const body = req.body;
    if(!body.platform){
        return res.status(400).json({
            message: "Platform is required",
        });
    }
    if (!Object.values(PlatformEnum).includes(body.platform.toLowerCase())) {
      return res.status(400).json({
        message: "Invalid platform",
      });
    }
    if(!body.username){
        return res.status(400).json({
            message: "Username is required",
        });
    }

    let platformKlass = await getPlatformByName(body.platform.toLowerCase(),req.user);
    const valid = await platformKlass.checkValidity(body.username);
    await db.platform.create({
      data: {
        userId: req.user.id,
        username: body.username,
        platform: body.platform.toLowerCase(),
        isValid: valid
      },
    });
    platformKlass = await getPlatformByName(body.platform.toLowerCase(),req.user);
    await platformKlass.getUserInfo();
    return res.status(201).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function patchPlatformController(req, res) {
  try {
    const body = req.body;
    if (
      body.platform &&
      !Object.values(PlatformEnum).includes(body.platform.toLowerCase())
    ) {
      return res.status(400).json({
        message: "Invalid platform",
      });
    }
    let valid = null;
    if (body.username) {
      let klass = await getPlatformByName(body.platform.toLowerCase(),req.user);
      valid = await klass.checkValidity(body.username)
    }
    await db.platform.update({
      where: {
        id: parseInt(req.params.platform_id),
        userId: req.user.id,
      },
      data: {
        username: body.username,
        platform: body.platform.toLowerCase(),
        isValid: valid,
        updatedAt: new Date(),
      },
    });
    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function extractUserInfoEndpoint(req, res){
    try {
      const process = await db.processRequest.findFirst({
        where:{
            userId:req.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
      if(moment().diff(process?.createdAt,"minutes") < 5 && process?.state===StateEnum.pending)
        return res.status(400).json({message:"User info extraction in progress"})
      if(moment().diff(process?.createdAt, "minutes")<5 && process?.state===StateEnum.processing){
        return res.status(400).json({message:"User info extraction in progress"})
      }
      if(moment().diff(process?.createdAt,"days")<1 && process?.state===StateEnum.completed){
        return res.status(400).json({message:"User info extraction already started, you can extract after 24 hours"});
      }
      if(moment().diff(process?.createdAt, "minutes")<30 && process?.state===StateEnum.failed){
        return res.status(400).json({message:"User info extraction failed, please try again after 30 mins"});
      }
      if(!process || process?.state===StateEnum.completed || process?.state===StateEnum.failed)
        await db.processRequest.create({
          data:{
            userId:req.user.id,
          }
        })
        console.log(process)
      extractUserInfo(req.user);
      return res.status(200).json({message:"User info extraction started"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
}