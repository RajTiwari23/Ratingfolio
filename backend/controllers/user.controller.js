import { PlatformEnum, StateEnum } from "@prisma/client";
import { db, getPlatformByName } from "../utils.js";
import {extractUserInfo} from "../tasks.js"

// Using a more modern approach for date comparison
import { DateTime } from "luxon";

export async function patchProfileController(req, res) {
  try {
    const { name, email, bio } = req.body;
    await db.$transaction(async (tx) => {
      if (name || email) {
        await tx.user.update({
          where: { id: req.user.id },
          data: { name, email, updatedAt: new Date() },
        });
      }
      if (bio) {
        await tx.profile.update({
          where: { id: parseInt(req.params.profile_id), userId: req.user.id },
          data: { bio, updatedAt: new Date() },
        });
      }
    });
    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getProfileController(req, res) {
  try {
    const profile = await db.profile.findFirst({
      where: { userId: req.user.id },
      select: {
        id: true,
        bio: true,
        rating: true,
        user: { select: { username:true, id: true, name: true, email: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function postProfileController(req, res) {
  try {
    const { bio } = req.body;
    const profile = await db.profile.findFirst({ where: { userId: req.user.id } });
    if (profile) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    await db.profile.create({ data: { userId: req.user.id, bio } });
    return res.status(201).json({ message: "Profile has been successfully created" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMinimalPlatformController(req, res) {
  try {
    const platforms = await db.platform.findMany({
      where: { userId: req.user.id },
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getDetailPlatformController(req, res) {
  try {
    const platform = await db.platform.findUnique({
      where: { id: parseInt(req.params.platform_id), userId: req.user.id },
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function postPlatformController(req, res) {
  try {
    const { platform: platformName, username } = req.body;
    if(!platformName || !username){
      return res.status(400).json({ message: "Platform and username are required." });
    }

    const platformLower = platformName.toLowerCase();
    if (!Object.values(PlatformEnum).includes(platformLower)) {
      return res.status(400).json({ message: "Invalid platform." });
    }

    const platformKlass = await getPlatformByName(platformLower, req.user);
    const valid = await platformKlass.checkValidity(username);

    await db.platform.create({
      data: {
        userId: req.user.id,
        username,
        platform: platformLower,
        isValid: valid,
      },
    });
    
    // Call getUserInfo after creating the record
    await platformKlass.getUserInfo();
    return res.status(201).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function patchPlatformController(req, res) {
  try {
    const { platform, username } = req.body;
    const platformId = parseInt(req.params.platform_id);

    if (platform && !Object.values(PlatformEnum).includes(platform.toLowerCase())) {
      return res.status(400).json({ message: "Invalid platform." });
    }

    let updateData = { updatedAt: new Date() };
    if (username) {
      const klass = await getPlatformByName(platform.toLowerCase(), req.user);
      updateData.isValid = await klass.checkValidity(username);
      updateData.username = username;
    }
    if (platform) {
      updateData.platform = platform.toLowerCase();
    }

    await db.platform.update({
      where: { id: platformId, userId: req.user.id },
      data: updateData,
    });

    return res.status(204).json();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function extractUserInfoEndpoint(req, res){
  try {
    const process = await db.processRequest.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const now = DateTime.now();

    if (process) {
      const createdAt = DateTime.fromJSDate(process.createdAt);
      if (process.state === StateEnum.pending || process.state === StateEnum.processing) {
        if (now.diff(createdAt, 'minutes').minutes < 5) {
          return res.status(400).json({ message: "User info extraction in progress" });
        }
      } else if (process.state === StateEnum.completed) {
        if (now.diff(createdAt, 'days').days < 1) {
          return res.status(400).json({ message: "User info extraction already started, you can extract after 24 hours" });
        }
      } else if (process.state === StateEnum.failed) {
        if (now.diff(createdAt, 'minutes').minutes < 30) {
          return res.status(400).json({ message: "User info extraction failed, please try again after 30 mins" });
        }
      }
    }
    
    await db.processRequest.create({ data: { userId: req.user.id } });
    extractUserInfo(req.user);
    return res.status(200).json({ message: "User info extraction started" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
