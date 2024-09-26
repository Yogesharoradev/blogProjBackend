import express from "express"
import { googleAuth, googleAuthCallback, Login, Logout, Signup } from "../controllers/auth.controller.js"
import passport from "passport"

const router = express.Router()

router.post("/signup" , Signup)
router.post("/login" , Login)
router.get("/logout" , Logout)
router.get("/google", googleAuth);

// Google OAuth callback route
router.get("/oauth2/redirect/google", passport.authenticate("google", {
    failureRedirect: "/login",
    session: true 
  }) , googleAuthCallback );

export default router

