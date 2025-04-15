import { db } from "../utils.js";
import { PlatformEnum, StateEnum } from "@prisma/client";
import { BasePlatform } from "./base.js";

export class CodeforcesPlatform extends BasePlatform {
  constructor(user, platforms) {
    super();
    this.user = user;
    this.platforms = platforms;
  }
  async getUserInfo() {
    if (!this.platforms || this.platforms.length === 0) {
      return null;
    }
    console.log("Codeforces: Get User Info");
    for (let platform of this.platforms) {
      const response = await fetch(
        `https://codeforces.com/api/user.info?handles=${platform.username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch user info");
        continue;
      }

      const data = await response.json();
      const userInfo = data.result[0];
      await db.platform.update({
        where: {
          id: platform.id,
        },
        data: {
          rating: userInfo.rating,
          maxRating: userInfo.maxRating,
          title: userInfo.rank,
          maxTitle: userInfo.maxRank,
          country: userInfo?.country,
        },
      });
    }
  }
  async getAllSubmissions(process_id) {
    if (!this.platforms || this.platforms.length === 0) {
      return null;
    }
    try {
      console.log("Codeforces: Get All Submissions");
      for (let platform of this.platforms) {
        let submissions = [];
        let counter = 1;
        let hasMoreData = true;

        while (hasMoreData) {
          const response = await fetch(
            `https://codeforces.com/api/user.status?handle=${platform.username}&from=${counter}&count=1000`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
              },
            }
          );

          if (!response.ok) {
            console.error("Failed to fetch submissions");
            break;
          }

          const data = await response.json();
          const fetchedSubmissions = data.result.map((element) => ({
            userId: this.user.id,
            submissionLink: `/contest/${element.contestId}/submission/${element.id}`,
            verdict: element.verdict === "OK" ? "AC" : "WA",
            problemLink: `/contest/${element.contestId}/problem/${element.problem.index}`,
            lang: element.programmingLanguage,
            platform: PlatformEnum.codeforces,
            time: element.creationTimeSeconds,
          }));

          submissions = submissions.concat(fetchedSubmissions);
          hasMoreData = fetchedSubmissions.length > 0;
          counter += 1000;

          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        const existingLinks = await db.submission.findMany({
          where: {
            submissionLink: { in: submissions.map((s) => s.submissionLink) },
          },
          select: { submissionLink: true },
        });

        const existingLinksSet = new Set(
          existingLinks.map((s) => s.submissionLink)
        );
        const newSubmissions = submissions.filter(
          (s) => !existingLinksSet.has(s.submissionLink)
        );

        if (newSubmissions.length > 0) {
          await db.$transaction(async (txc) => {
            await txc.submission.createMany({
              data: newSubmissions,
              skipDuplicates: true,
            });
          });
        }
      }
    } catch (error) {
      console.error(error);
      await db.processRequest.update({
        where: {
          id: process_id,
        },
        data: {
          state: StateEnum.failed,
        },
      });
    }
  }
  async getAllContests() {
    const response = await fetch(
      `https://codeforces.com/api/contest.list?gym=false`
    );
    console.log("Codeforces: Get All Contests");
    const data = await response.json();
    const existingContests = await db.contest.findMany({
      where: {
        platform: PlatformEnum.codeforces,
      },
      select: {
        url: true,
      },
    });
    const existingContestUrls = existingContests.map((c) => c.url);
    const newContests = data.result
      .filter((contest) => contest.phase !== "BEFORE")
      .filter(
        (contest) => !existingContestUrls.includes(`/contests/${contest.id}`)
      )
      .map((contest) => ({
        name: contest.name,
        url: `/contests/${contest.id}`,
        platform: PlatformEnum.codeforces,
        time: contest.startTimeSeconds,
      }));
    await db.contest.createMany({
      data: newContests,
      skipDuplicates: true,
    });
  }
  async getParticipatedContests(process_id) {
    if (!this.platforms || this.platforms.length == 0) {
      return null;
    }
    try{
    for (let platform of this.platforms) {
      if (!platform.username) continue;
      const response = await fetch(
        `https://codeforces.com/api/user.rating?handle=${platform.username}`
      );
      const data = await response.json();
      if (data.status !== "OK") continue;
      const participatedContests = data.result.map((contest) => ({
        name: contest.contestName,
        url: `/contests/${contest.contestId}`,
        platform: PlatformEnum.codeforces,
      }));
      const existingContests = await db.contest.findMany({
        where: {
          platform: PlatformEnum.codeforces,
          url: { in: participatedContests.map((c) => c.url) },
        },
      });
      const existingContestIds = existingContests.map((c) => c.id);
      const RegisteredContests = await db.participatedContest.findMany({
        where: {
          userId: this.user.id,
          contestId: { in: existingContestIds },
        },
      });
      const notRegisteredContests = existingContestIds.filter(
        (contestId) =>
          !RegisteredContests.some((c) => c.contestId === contestId)
      );
      await db.$transaction(async (txc) =>{

        await txc.participatedContest.createMany({
          data: notRegisteredContests.map((contestId) => ({
            userId: this.user.id,
            contestId: contestId,
          })),
        });
      })
    }
  }catch(error){
    console.error(error)
    await db.processRequest.update({
      where:{
        id:process_id
      },
      data:{
        state:StateEnum.failed
      }
    })
  }
  }
  async calculateAccuracy() {
    if (!this.platforms || this.platforms.length == 0) {
      return null;
    }
    let submissions = await db.submission.findMany({
      where: {
        platform: PlatformEnum.codeforces,
        userId: this.user.id,
      },
    });
    let correct = 0;
    let total = submissions.length;
    for (let submission of submissions) {
      if (submission.verdict == "AC") {
        correct++;
      }
    }
    return (correct / total).toPrecision(4) * 100;
  }
  async checkValidity(user_handle) {
    const response = await fetch(
      `https://codeforces.com/api/user.info?handles=${user_handle}`
    );
    const data = await response.json();
    return data.status === "OK";
  }
}
