import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      port: Number(process.env.MYSQL_DB_PORT),
      ssl:
        process.env.MYSQL_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });

    const [rows]: any = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("Email entered:", email);
    console.log("Rows found:", rows.length);


    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch);


    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
