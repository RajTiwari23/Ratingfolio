import { db, hashPassword, generateJWTToken, checkPassword, checkDurability } from "../utils.js";

export async function LoginController(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await db.user.findUnique({ where: { email } });
    // Use generic message for security, don't reveal if user exists.
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "User is not verified." });
    }

    const credentials = await db.authCredential.findUnique({ where: { userId: user.id } });
    if (!credentials) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!checkPassword(password, credentials.password)) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateJWTToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "An unexpected error occurred. Please try again." });
  }
}

export async function RegisterController(req, res) {
  try {
    const { email, password, username, name } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Email, password, and username are required." });
    }

    // Use a database transaction to ensure atomicity.
    await db.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error("User registration failed.");
      }

      if (!checkDurability(password)) {
        throw new Error("Password is not strong enough.");
      }

      if (username.toLowerCase() === "search") {
        throw new Error("Forbidden username.");
      }

      const newUser = await tx.user.create({ data: { username, email, name, verified: true } });
      const hashedPassword = hashPassword(password);
      await tx.authCredential.create({ data: { password: hashedPassword, userId: newUser.id } });

      const otp = Math.floor(Math.random() * 100000 + 90000);
      await tx.resetPasswordToken.create({ data: { otp, userId: newUser.id } });

      // fireVerifyOtp(newUser.email, otp);

      return res.status(201).json({ message: "Registration successful. Please check your email for a verification code." });
    });
  } catch (error) {
    console.error("Registration Error:", error);
    // Return generic error message to the client.
    return res.status(500).json({ message: "An unexpected error occurred. Please try again." });
  }
}

// import moment from "moment"; - No longer needed in this function

export async function getSearchProfileController(req,res){
  try{
    const username = req.query.query;
    // Explicitly parse page and page_size to numbers
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const pageSize = parseInt(req.query.page_size) > 0 ? parseInt(req.query.page_size) : 10;
    
    // Check if a search query is provided
    if (!username) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const searchFilter = {
      where: {
        user: {
          OR:[
            // Case-insensitive search using 'mode: "insensitive"'
            { username: { contains: username, mode: 'insensitive' } },
            { name: { contains: username, mode: 'insensitive' } }
          ],
        },
      },
    };
    
    const [profileCount, profiles] = await db.$transaction([
      db.profile.count(searchFilter),
      db.profile.findMany({
        ...searchFilter,
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          id: "desc"
        }
      })
    ]);

    return res.status(200).json({
      page: page,
      page_size: pageSize,
      total: profileCount,
      result: profiles
    })
  } catch(error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
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
