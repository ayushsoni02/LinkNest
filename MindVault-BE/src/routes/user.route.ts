import { Router } from "express";
import { userMiddleware } from "../middlewares/middleware";
import { registerUser, loginUser, getCurrentUser, refreshAccessToken } from "../controllers/user.controllers";

const router: Router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/profile").get(userMiddleware, getCurrentUser);

export default router;