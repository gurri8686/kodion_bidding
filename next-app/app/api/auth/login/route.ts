import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email: string = body.email?.trim();
    const password: string = body.password?.trim();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQL_DB_HOST,
      user: process.env.MYSQL_DB_USER,
      password: process.env.MYSQL_DB_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      port: Number(process.env.MYSQL_DB_PORT),
    });

    const [rows] = await connection.execute<User[]>(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    if (rows.length === 0) {
      return Response.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error: unknown) {
    console.error("FULL ERROR:", error);

    return Response.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
