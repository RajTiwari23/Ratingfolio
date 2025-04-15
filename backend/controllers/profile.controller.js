import { db } from "../utils.js";
import moment from "moment";

export async function getSearchProfileController(req,res){
  try{
    const username = req.query.query;
    const page = req.query.page ? req.query.page-1: 1;
    const page_size = req.query.page_size ? req.query.page_size: 10;
    const search_filter = {
        where: {
          user: {
            OR:[
              {username:{
                contains:username
              }},
              {name:{
                contains:username
              }}
            ]
          },
        },
    }
    const profileCount = await db.profile.count(search_filter)
    const profile = await db.profile.findMany({
        ...search_filter,
        select: {
          id: true,
          bio: true,
          rating: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username:true,
              createdAt: true,
            },
          },
        },
        skip: (page)*page_size,
        take: page_size,
        orderBy:{
          id: "desc"
        }
    })
    return res.status(200).json({
      page:page,
      page_size:page_size,
      total:profileCount,
      result:profile
    })
  }catch(error){
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

export async function getUserProfileController(req, res) {
  try {
    const username = req.params.username;
    const profile = await db.profile.findFirst({
      where: {
        user: {
          username: username,
        },
      },
      select: {
        id: true,
        bio: true,
        rating: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });
    if (!profile) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
  }
}

export async function getUserSubmissions(req, res) {
  try {
    const username = req.params.username;
    const page = req.query.page > 0 ? parseInt(req.query.page) : 1;
    const page_size = req.query.page_size ? req.query.page_size : 10;
    if (
      !(await db.user.findUnique({
        where: {
          username: username,
        },
      }))
    ) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    const submissionsCount = await db.submission.count({
      where: {
        user: {
          username: username,
        },
      },
    });
    const submissions = await db.submission.findMany({
      where: {
        user: {
          username: username,
        },
      },
      skip: (page - 1) * page_size,
      take: page_size,
      orderBy: {
        time: "desc",
      },
    });
    return res
      .status(200)
      .json({
        page: page,
        total: submissionsCount,
        page_size: page_size,
        result: submissions,
      });
  } catch (error) {
    console.error(error);
  }
}

export async function getUserContests(req, res) {
  try {
    console.log(req.params)
    const username = req.params.username;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const page_size = req.query.page_size ? parseInt(req.query.page_size) : 10;
    if (
      !(await db.user.findUnique({
        where: {
          username: username,
        },
      }))
    ) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const contestsCount = await db.participatedContest.count({
      where: {
        user: {
          username: username,
        },
      },
    });
    const contests = await db.participatedContest.findMany({
      where: {
        user: {
          username: username,
        },
      },
      select: {
        id: true,
        contest: {
          select: {
            id: true,
            name: true,
            url: true,
            platform: true,
            time: true,
          },
        },
      },
      orderBy: {
        contest: {
          time: "desc",
        },
      },
      skip: (page - 1) * page_size,
      take: page_size,
    });
    return res.status(200).json({
      page: page,
      total: contestsCount,
      page_size: page_size,
      result: contests,
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getUserPlatforms(req, res) {
  try {
    const username = req.params.username;
    if (
      !(await db.user.findUnique({
        where: {
          username: username,
        },
      }))
    )
      return res.status(404).json({ message: "User not found" });

    const platforms = await db.platform.findMany({
      where: {
        user: {
          username: username,
        },
      },
      select: {
        id: true,
        username: true,
        platform: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json({ result: platforms });
  } catch (error) {
    console.error(error);
  }
}

export async function getDayWiseSubmissionCount(req, res) {
  try {
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({
        message: "Username is required.",
      });
    }
    const user = await db.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    let submissions = await db.submission.findMany({
      where: {
        userId: user.id,
      },
    });
    submissions = submissions.map((submission) => {
      return {
        ...submission,
        time: moment.unix(submission.time).format("DD/MM/YYYY"),
      };
    });
    const dayWiseSubmissions = submissions.reduce((acc, submission) => {
      const day = submission.time;
      if (!acc[day]) {
        acc[day] = 0;
      }
      acc[day]++;
      return acc;
    }, {});
    return res.status(200).json({
      result: dayWiseSubmissions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    })
  }
}
