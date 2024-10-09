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
    origin: ["https://yuviblogproject.netlify.app", "http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
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


app.use(passport.initialize());
app.use(passport.session());


app.use("/auth", AuthRouter); 
app.use("/", blogRouter); 

app.get("/api/user", (req, res) => {

  try{
    console.log("API User endpoint hit"); 
    if (!req.session.userId) {
      return res.status(402).json({ message: "Not authenticated" });
    }
    console.log("Session data:", req.session); 
    return res.status(200).json({ 
      message: 'User logged in successfully',
      user: {
        _id: req.session.user.id,  
        name: req.session.user.name, 
        email: req.session.user.email,
      },
  });
 
  }catch(err){
    console.log(err)
    return res.status(500).json({ message: "Not authenticated" });
  }
});
 

app.post("/api/gemini" , Generate)


app.listen(8080, () => {
  console.log("Server running on port 8080");
});
