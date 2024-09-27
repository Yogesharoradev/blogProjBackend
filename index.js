import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo"
import dbConnect from "./lib/db.lib.js";
import AuthRouter from "./routes/auth.route.js";
import blogRouter from "./routes/blog.router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import User from "./models/auth.model.js";
import { Generate } from "./lib/gemini.lib.js";

dotenv.config();

const app = express();
dbConnect();

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session expires in 24 hours
    },
  })
);


// CORS configuration
app.use(
  cors({
    origin: ["https://yuviblogproject.netlify.app"], // Your frontend origin
    credentials: true, // Allow credentials
  })
);

// Body parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Passport Google OAuth setup
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://blogprojbackend.onrender.com/auth/oauth2/redirect/google", 
      passReqToCallback: true,
    },
     async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
)

// Initialize passport and sessions
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.use("/auth", AuthRouter); // Authentication routes
app.use("/", blogRouter); // Blog routes
app.get("/api/user", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({ id: req.user._id, name: req.user.name, email: req.user.email });
});

app.get("/api/gemini" , Generate)

// Start server
app.listen(8080, () => {
  console.log("Server running on port 8080");
});
