import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const [rows] = await pool.query("SELECT 1");
    return NextResponse.json({ message: "DB Working", rows });
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
