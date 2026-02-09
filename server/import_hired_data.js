const fs = require("fs");
const csv = require("csv-parser");
const mysql = require("mysql2/promise");

// -------------------- DB CONFIG --------------------
const dbConfig = {
  host: "43.255.154.125",
  user: "bidding_dev",
  password: "Kodion@2017",
  database: "bidding_tracking",
  port: 3306,
  waitForConnections: true,
};

let db;
let adminUserId = null;

// -------------------- UTILITY FUNCTIONS --------------------

// Convert Month → Number
const monthToNumber = (m) => {
  if (!m) return "01";
  const months = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };
  m = m.toLowerCase().trim();
  return months[m] || "01";
};

// Status → stage mapping
const stageConvert = (s) => {
  if (!s) return "hired";
  s = s.toLowerCase();
  if (s.includes("contract ended")) return "hired";
  if (s.includes("paused")) return "paused";
  if (s.includes("ongoing")) return "ongoing";
  return "hired";
};

// Fetch userId by firstname
async function getUserId(firstname) {
  if (!firstname) return null;
  const [rows] = await db.query(
    "SELECT id FROM users WHERE firstname = ? LIMIT 1",
    [firstname.trim()]
  );
  return rows.length ? rows[0].id : null;
}

// -------------------- CSV PROCESSING --------------------
async function processCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream("hired_data.csv")
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        for (const row of results) {
          try {
            const year = row["Year"]?.trim();
            const month = row["Month"]?.trim();
            const client = (row["Client Name"] || "").trim();
            let bidder = (row["Bidder name"] || "").trim();
            const status = row["Current Status"];
            const business = row["Business ($)"];
            const projectName = row["Project Name "]?.trim();
            const profileName = row["Profile "]?.trim();

            if (!year && !client) continue;

            if (!bidder) bidder = "Admin";

            let userId = await getUserId(bidder);
            if (!userId) {
              console.log(`⚠ Bidder not found (${bidder}) → using Admin`);
              userId = adminUserId;
            }

            const hiredDate = `${year}-${monthToNumber(month)}-01`;

            // ---------------- Insert into applied_jobs ----------------
            // jobId column should be AUTO_INCREMENT in DB
            const [insertApplied] = await db.query(
              `INSERT INTO applied_jobs (
                bidder_name, profile_name, technologies, connects_used, proposal_link,
                applied_at, userId, platformId,
                created_at, updated_at,
                manual_job_title, manual_job_description, manual_job_url, profileId,
                stage, replyDate, replyNotes, interviewDate, interviewNotes,
                not_hired_notes, hired_date
              ) VALUES (?, ?, NULL, 0, NULL,
                ?, ?, 1,
                NOW(), NOW(),
                ?, ?, NULL, NULL,
                ?, NULL, NULL, NULL, NULL,
                NULL, ?
              )`,
              [
                bidder,
                profileName,
                hiredDate,
                userId,
                projectName,
                client,
                stageConvert(status),
                hiredDate
              ]
            );

            // Use the AUTO_INCREMENT jobId from applied_jobs
            const newJobId = insertApplied.insertId;

            // ---------------- Insert into hired_jobs ----------------
            await db.query(
              `INSERT INTO hired_jobs (
                jobId, bidderId, developerId,
                hiredAt, notes, createdAt, updatedAt,
                budgetType, clientName, profileName, budgetAmount, hired_date
              ) VALUES (?, ?, NULL,
                ?, NULL, NOW(), NOW(),
                'fixed', ?, ?, ?, ?
              )`,
              [
                newJobId,
                userId,
                hiredDate,
                client,
                profileName,
                (business || "").replace("$", "").replace(",", "").trim() || 0,
                hiredDate
              ]
            );

            console.log(`✔ Imported: ${client}`);

          } catch (err) {
            console.log("❌ Error Importing Row:", err.message);
          }
        }

        resolve();
      })
      .on("error", reject);
  });
}

// -------------------- INIT --------------------
async function init() {
  try {
    db = await mysql.createPool(dbConfig);

    adminUserId = await getUserId("Admin");
    if (!adminUserId) {
      console.log("❌ ERROR: Admin user not found in DB!");
      process.exit(1);
    }

    console.log("✅ DB connected, starting import...");

    await processCSV();

    console.log("🎉 Import Completed Successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Initialization Error:", err.message);
    process.exit(1);
  }
}

init();
