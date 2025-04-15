import { StateEnum, PlatformEnum } from "@prisma/client";
import { db, getPlatformByName, sleep } from "./utils.js";

export async function extractUserInfo(user) {
  try {
    const process = await db.processRequest.findFirst({
      where: {
        userId: user.id,
        OR: [{ state: StateEnum.pending }, { state: StateEnum.failed }],
      },
      orderBy: { createdAt: "desc" },
    });
    if (!process) {
      return;
    }
    await db.$transaction(
      async (tx) => {
        await tx.processRequest.update({
          where: { id: process.id },
          data: { state: StateEnum.processing },
        });
        const platforms = Object.values(PlatformEnum);
        const processPromise = [];
        for (const platform of platforms) {
          const platformKlass = await getPlatformByName(platform, user);
          processPromise.push(platformKlass.getAllSubmissions(process.id));
          processPromise.push(
            platformKlass.getParticipatedContests(process.id)
          );
        }
        await Promise.all(processPromise);
        console.log("Extraction completed for user: ", user.id);
        if (
          await tx.processRequest.findUnique({
            where: {
              id: process.id,
              state: {
                not: StateEnum.failed,
              },
            },
          })
        )
          await tx.processRequest.update({
            where: { id: process.id },
            data: { state: StateEnum.completed },
          });
      },
      { timeout: 1000 * 60 * 10 }
    );
  } catch (error) {
    console.error(error);
  }
}

export async function fireVerifyOtp(email, otp) {}

export async function fireResetPasswordOtp(email, otp) {}
