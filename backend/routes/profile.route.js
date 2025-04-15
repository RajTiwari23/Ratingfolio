import express from "express"
import { 
    getUserProfileController, 
    getUserSubmissions, 
    getUserContests, 
    getUserPlatforms, 
    getDayWiseSubmissionCount, 
    getSearchProfileController 
} from "../controllers/profile.controller.js"
const router = express.Router()

router.get("/:username", getUserProfileController)
router.get("/:username/submissions", getUserSubmissions)
router.get("/:username/contests", getUserContests)
router.get("/:username/platforms", getUserPlatforms)
router.get("/:username/daywise", getDayWiseSubmissionCount)

export default router