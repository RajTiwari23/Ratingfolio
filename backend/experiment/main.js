// import puppeteer from "puppeteer";
import moment from "moment";

const user_handle = "yolokun";
// const browser = await puppeteer.launch({
//   headless: false,
// });

import { chromium } from "playwright-extra";

import { expect } from "playwright/test";

let failCounter = 0;
(async () => {
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
  const response = await fetch(
    `https://www.codechef.com/recent/user?user_handle=${user_handle}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      },
    },
  );
  if (!response.ok) {
    console.error("Unable to fetch users submissions");
    return;
  }

  const data = await response.json();
  const pages = data["max_page"];
  // for (let i = 1; i <= pages; i++) {
  //   getSubmissions(context, i);
  //   console.log("Waiting for 5-10 seconds : ", i);
  //   await new Promise((resolve) =>
  //     setTimeout(resolve, 1000 * (Math.floor(Math.random() * 10) + 5)),
  //   );
  // }
  console.log("Failed Counter :", failCounter);
  await page.goto(`https://codechef.com/users/${user_handle}`, {
    waitUntil: "networkidle",
    timeout: 1000 * 60 * 5,
  });
  // contest participations
  getParticipateContest(page);
  // await browser.close();
})();
// getSubmissions()

async function getSubmissions(browser, pageno) {
  const response = await fetch(
    `https://www.codechef.com/recent/user?user_handle=${user_handle}&page=${pageno}&_=${Date.now()}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      },
    },
  );
  if (!response.ok) {
    try {
      const data = await response.json();
      console.log(data);
      console.error("Unable to fetch users submissions");
      return;
    } catch (error) {
      failCounter++;
      console.error(error);
      return;
    }
  }

  const data = await response.json();
  const page = await browser.newPage();
  await page.setContent(data["content"]);
  const table = await page.locator("table.dataTable");
  const tbody = await table.locator("tr").all();
  let counter = 0;
  let submission = []
  for (let i of tbody) {
    if (counter > 0) {
      const tds = await i.locator("td").all();
      const obj = {}
      if (expect(tds[0]).toHaveAttribute("title"))
        // console.log(
        //   "Submission Time :",
        //   moment(await tds[0].getAttribute("title"), "hh:mm A DD/MM/YY").utc(),
        // );
        obj["submissionTime"] = moment(await tds[0].getAttribute("title"), "hh:mm A DD/MM/YY").utc()
      // console.log(
      //   "Problem link :",
      //   await tds[1].locator("a").getAttribute("href"),
      // );
      obj["problemLink"] = await tds[1].locator("a").getAttribute("href")
      // console.log(
      //   "Verdict :",
      //   await tds[2].locator("span").first().getAttribute("title"),
      // );
      obj["verdict"] = await tds[2].locator("span").first().getAttribute("title")
      // console.log(
      //   "Lang :",
      //   await tds[3].innerText(),
      // );
      obj["lang"] = await tds[3].innerText()
      // console.log(
      //   "Submission Link :",
      //   await tds[4].locator("a").getAttribute("href"),
      // );
      obj["submissionLink"] = await tds[4].locator("a").getAttribute("href")
      submission.push(obj)
    }
    counter++;
  }
  await page.close();
}

async function getParticipateContest(page) {
  const data = await page.locator(
    "section.rating-data-section.problems-solved",
  );
  await data.scrollIntoViewIfNeeded();
  await data.screenshot({
    path: "testing.png",
  });
  let contest_names = await data.evaluate(() => {
    const headings = document.querySelectorAll(".content");

    let names = [];
    for (let heading of headings) {
      const h5 = heading.querySelector("h5");
      if (h5) {
        const span = h5.querySelector("span");
        const regex = new RegExp(" Division \\d( \\(.*\\))?", "g");
        names.push(span.innerText.replace(regex, ""));
      }
    }
    return names;
  });
  contest_names = Array.from(new Set(contest_names));

  console.log(contest_names);
}
// const page = await browser.newPage();
// await page.setViewport({
//   isLandscape: true,
//   height: 1080,
//   width: 1920,
// });
// page.on("networkidle2", () => console.log("Hogaya load"));
// page.on("request", (request) => {
//   console.log(request.url());
// });

// page.on("response", (response) => {
//   console.log(response.url());
// });

// await page.goto(`https://codechef.com/users/${user_handle}`, {
//   waitUntil: "networkidle2",
//   timeout: 1000 * 60 * 4,
// });

// await page.screenshot({
//   path: "homepage.png",
// });
// const data = await page.$("section.rating-data-section.problems-solved");
// await data.scrollIntoView();
// await data.screenshot({
//   path: "testing.png",
// });

// // contest_names attended by the user
// const contest_names = await data.evaluate(() => {
//   const headings = document.querySelectorAll(".content");

//   let names = [];
//   for (let heading of headings) {
//     const h5 = heading.querySelector("h5");
//     if (h5) {
//       const span = h5.querySelector("span");
//       names.push(span.innerText);
//     }
//   }
//   return names;
// });

// console.log(contest_names);

// const rating = await page.$("div.widget-rating");
// await rating.scrollIntoView();
// await rating.screenshot({
//   path: "rating.png",
// });

// //rating
// const value = await rating.$eval(".rating-number", (elem) => elem.innerText);

// console.log(value);

// const response = await fetch(
//   `https://www.codechef.com/recent/user?user_handle=${user_handle}`,
// );

// if (!response.ok) console.error("Laude lag gaye");

// const submissions_data = await response.json();
// const newPage = await browser.newPage();
// const submissions = [];

// await newPage.setContent(submissions_data.content);
// await newPage.waitForNetworkIdle("networkidle2");
// const table = await newPage.$("table.dataTable");
// await table.screenshot({
//   path: "table.png",
// });

// const tbody = await table.$("tbody");
// await tbody.screenshot({
//   path: "tbody.png",
// });

// const da = await table.$eval("tr", (elem) => {
//   return elem;
// });
// console.log(da);

// const da = await table.$eval("tbody", (elem) => {
//   return elem.childNodes;
// });
// console.log(da);

// const ratingValue = await page.evaluate(() => {
//   let value = document.querySelectorAll("rating-header");
//   let elem = [];
//   for (let i of value) {
//     if (Object.keys(i).length) elem.push(i.innerText);
//   }
//   return { document, value: elem };
// });

// console.log(ratingValue.value);
