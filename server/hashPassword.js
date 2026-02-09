const bcrypt = require("bcryptjs");

const password = "Admin@1234";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    console.log("Hashed Password:", hash);
    console.log("\nNow run this SQL query to update your user:");
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@gmail.com';`);
  }
});
