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
