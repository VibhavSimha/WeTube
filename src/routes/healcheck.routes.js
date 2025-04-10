import {Router} from "express";
import { healthcheck } from "../controllers/healthcheck.js";

const router =Router()
// /api/v1/healthcheck/<below routes>
router.route("/").get(healthcheck)

export default router