import { db, sleep } from "../utils.js";
import { PlatformEnum, StateEnum } from "@prisma/client";

import { BasePlatform } from "./base.js";
import { chromium } from "playwright-extra";
import moment from "moment";

export class CodeChefPlatform extends BasePlatform {
  constructor(user, platforms) {
    super();
    this.user = user;
    this.platforms = platforms;
  }
  async getUserInfo() {
    if (!this.platforms || this.platforms.length === 0) {
      return null;
    }
    console.log("Codechef: Get User Info");
    const browser = await chromium.launch({ headless:true });
    for (let platform of this.platforms) {
      if (!platform.username) continue;
      //TODO: Still need to figure out.
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`https://www.codechef.com/users/${platform.username}`);
      const countryTag = await page.locator(".user-country-name").textContent();
      const ratingHeader = await page.locator("div.rating-header");
      const title = await page.locator("span.rating").textContent();
      const maxTitle = title;
      const rating = await ratingHeader
        .locator("div.rating-number")
        .textContent();
      let maxRating = await ratingHeader.locator("small").textContent();
      maxRating = maxRating.replace("\\(Highest Rating ", "");
      maxRating = maxRating.replace("\\d+\\)", "");
      await db.platform.update({
        where: {
          id: platform.id,
        },
        data: {
          rating: parseInt(rating),
          maxRating: parseInt(maxRating),
          country: countryTag,
          title: title,
          maxTitle: maxTitle,
        },
      });
      await context.close();
    }
  }
  async getAllSubmissions(process_id) {
    if (!this.platforms || this.platforms.length == 0) {
      return null;
    }
    console.log("Codechef: Get All Submissions");
    const browser = await chromium.launch({ headless: true });
    try{
    for (let platform of this.platforms) {
      if (!platform.username) continue;
      const context = await browser.newContext();
      const response = await fetch(
        `https://www.codechef.com/recent/user?user_handle=${platform.username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );
      if (!response.ok) {
        console.error("Unable to fetch users submissions");
        continue;
      }

      const data = await response.json();
      if (!data || !data["max_page"]) {
        continue;
      }

      const pages = data["max_page"];
      let submissions = [];
      for (let i = 1; i <= pages; i++) {
        console.log("Fetching page: ", i);
        submissions = submissions.concat(
          await this._getSubmissions(context, i, platform.username)
        );
        await sleep();
      }

      const existingSubmissionLinks = await db.submission.findMany({
        where: { userId: this.user.id, platform: PlatformEnum.codechef },
        select: { submissionLink: true },
      });
      const existingSubmissionLinksSet = new Set(
        existingSubmissionLinks.map((s) => s.submissionLink)
      );
      let newSubmissions = submissions.filter(
        (submission) =>
          submission.submissionLink &&
          !existingSubmissionLinksSet.has(submission.submissionLink)
      );
      if (newSubmissions.length > 0) {
        await db.$transaction(async (txc) =>{
          await txc.submission.createMany({
            data: newSubmissions.map((submission) => ({
              platform: PlatformEnum.codechef,
              userId: this.user.id,
              submissionLink: submission.submissionLink,
              verdict: submission.verdict === "accepted" ? "AC" : "WA",
              problemLink: submission.problemLink,
              lang: submission.lang,
              time: submission.submissionTime,
            })),
            skipDuplicates:true,
          });
        })
      }
      await context.close();
    }
    }catch(error){
      console.error(error)
      await db.processRequest.update({
        where:{id:process_id},
        data:{state:StateEnum.failed}
      })
    }
    await browser.close();
  }

  async getAllContests() {
    let contests = [];
    console.log("Codechef: Get All Contests");
    const response = await fetch(
      `https://www.codechef.com/api/list/contests/past?sort_by=START&sorting_order=desc&mode=all`
    );
    const data = await response.json();
    contests = contests.concat(data.contests);
    console.log(contests);
    contests = contests.map((contest) => {
      return {
        name: contest.contest_name,
        url: `/${contest.contest_code}`,
        platform: PlatformEnum.codechef,
        time: new Date(contest.contest_start_date_iso).getTime(),
      };
    });
    let temp = data.contests;
    let offset = temp.length + 1;
    while (temp.length > 0) {
      console.log("Fetching more contests : ", offset);
      const response = await fetch(
        `https://www.codechef.com/api/list/contests/past?sort_by=START&sorting_order=desc&offset=${offset}&mode=all`
      );
      const data = await response.json();
      temp = data.contests;

      temp = temp.map((contest) => {
        return {
          name: contest.contest_name,
          url: `/${contest.contest_code}`,
          platform: PlatformEnum.codechef,
          time: new Date(contest.contest_start_date_iso).getTime(),
        };
      });
      contests = contests.concat(temp);
      offset += temp.length;
    }
    let uploaded_contest = [];
    try {
      for (let contest of contests) {
        const dbContest = await db.contest.findUnique({
          where: {
            url: contest.url,
          },
        });
        if (!dbContest) {
          uploaded_contest.push({
            name: contest.name,
            url: contest.url,
            platform: PlatformEnum.codechef,
            time: contest.time / 1000,
          });
        }
      }
      await db.contest.createMany({
        data: uploaded_contest,
        skipDuplicates: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async getParticipatedContests(process_id) {
    if (!this.platforms || this.platforms.length == 0) {
      return null;
    }
    try{
    console.log("Codechef: Get Participated Contests");
    const browser = await chromium.launch({ headless: true });
    for (let platform of this.platforms) {
      if (!platform.username) continue;
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`https://www.codechef.com/users/${platform.username}`);
      const participatedContests = await this._getParticipatedContests(page);
      console.log(participatedContests)
      let dbContests = [];
      for(let contest of participatedContests){
        const contests = await db.contest.findMany({
          where: {
            platform: PlatformEnum.codechef,
            name:{
              contains: contest
            }
          },
        });
        dbContests = dbContests.concat(contests)
      }
      const dbContestIds = dbContests.map((c) => c.id);
      const existingParticipatedContest = await db.participatedContest.findMany({
        where:{
          userId:this.user.id,
          contestId:{in:dbContestIds}
        }
      })
      const newParticipatedContest = dbContestIds.filter((id) => !existingParticipatedContest.find((c) => c.contestId === id));
      await db.$transaction(async (txc)=>{
        await txc.participatedContest.createMany({
          data: newParticipatedContest.map((id) => ({
            userId: this.user.id,
            contestId: id,
          })),
        });
        const process = await txc.processRequest.findFirst({
            where:{id:process_id},
          })
          if(process.state===StateEnum.failed){
            return;
          }
      })
    }
    }catch(error){
      console.error(error);
      await db.processRequest.update({
        where:{id:process_id},
        data:{state:StateEnum.failed}
      })
    }
  }
  async calculateAccuracy() {
    if (!this.platforms || this.platforms.length == 0) {
      throw new Error("No platforms found for user");
    }
    console.log("Codechef: Calculate Accuracy");
    const submissions = await db.submission.findMany({
      where: {
        platform: PlatformEnum.codechef,
        userId: this.user.id,
      },
    });

    if (!submissions || submissions.length == 0) {
      throw new Error("No submissions found for user");
    }

    let total = submissions.length;
    let correct = 0;
    for (const submission of submissions) {
      if (submission.verdict === "AC") {
        correct++;
      }
    }
    return (correct / total).toPrecision(4) * 100;
  }
  async _getParticipatedContests(page) {
    const data = await page.locator(
      "section.rating-data-section.problems-solved"
    );
    await data.scrollIntoViewIfNeeded();
    const contest_names = await data.evaluate(() => {
      const headings = document.querySelectorAll(".content");

      let names = new Set();
      for (let heading of headings) {
        const h5 = heading.querySelector("h5");
        if (h5) {
          const span = h5.querySelector("span");
          const divisionRegex = new RegExp(" Division \\d", "g");
          const ratedRegex = new RegExp(" \\(([^)]+)\\)", "g");
          const contestName = span.innerText.replace(divisionRegex,"").replace(ratedRegex,"");
          names.add(contestName);
        }
      }
      return Array.from(names);
    });
    return contest_names;
  }
  async _getSubmissions(context, pageno, username) {
    try {
      const response = await fetch(
        `https://www.codechef.com/recent/user?user_handle=${username}&page=${pageno}&_=${Date.now()}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );
      if (!response.ok) {
        console.error("Unable to fetch users submissions");
        return [];
      }

      const jsonString = await response.text();
      if (jsonString[0] === "<") return [];
      const data = JSON.parse(jsonString);
      const page = await context.newPage();
      await page.setContent(data["content"]);
      const table = await page.locator("table.dataTable");
      const tbody = await table.locator("tr").all();
      let counter = 0;
      let submission = [];
      for (let i of tbody) {
        if (counter > 0) {
          const tds = await i.locator("td").all();
          const obj = {};
          if (tds[0] && (await tds[0].getAttribute("title")) !== null) {
            obj["submissionTime"] = moment(
              await tds[0].getAttribute("title"),
              "hh:mm A DD/MM/YY"
            ).unix();
          }
          if (
            tds[1] &&
            (await tds[1].locator("a").getAttribute("href")) !== null
          ) {
            obj["problemLink"] = await tds[1].locator("a").getAttribute("href");
          }
          if (
            tds[2] &&
            (await tds[2].locator("span").first().getAttribute("title")) !==
              null
          ) {
            obj["verdict"] = await tds[2]
              .locator("span")
              .first()
              .getAttribute("title");
          }
          if (tds[3] && (await tds[3].innerText()) !== null) {
            obj["lang"] = await tds[3].innerText();
          }
          if (
            tds[4] &&
            (await tds[4].locator("a").getAttribute("href")) !== null
          ) {
            obj["submissionLink"] = await tds[4]
              .locator("a")
              .getAttribute("href");
          }
          if(!obj["submissionLink"]) continue;
          submission.push(obj);
        }
        counter++;
      }
      await page.close();
      return submission;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async checkValidity(user_handle) {
    const browser = await chromium.launch({
      headless: true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
      isLandscape: true,
      height: 1080,
      width: 1920,
    });
    await page.goto(`https://codechef.com/users/${user_handle}`, {
      waitUntil: "networkidle",
      timeout: 1000 * 60 * 4,
    });
    let modal = null;
    try {
      modal = await page.locator("div.popup_background");
    } catch (e) {
      console.log(e);
    }
    if ((await modal.count()) > 0) return false;
    return true;
  }
}
