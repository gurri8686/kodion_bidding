const express = require("express");
const { setWeeklyTarget,getWeeklyTarget } = require("../controller/targetController");

const router = express.Router();

router.post("/set-target", setWeeklyTarget);
router.get("/get-target", getWeeklyTarget);

module.exports = router;
