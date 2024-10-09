import User from "../models/auth.model.js"
import bcrypt from "bcrypt"
import passport from "passport"



export const Signup =async (req,res)=>{
try {
    const { name, email, password} = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({
      name,
      email,
      password,
    });
   
    const savedUser = await newUser.save();

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        name: savedUser.name,
        email: savedUser.email,
      }
    });

} catch (error) {
        res.status(500).json( {success :false , message :"error in signup"})
        console.log(error)
}
}


export const Login = async (req, res) => {
  try {   
      const { email, password } = req.body;

      // Validate email and password
      if (!email || !password) {
          return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'User not found, please signup' });
      }

      // Compare provided password with stored password
      const isPass = await bcrypt.compare(password, user.password);
      if (!isPass) {
          return res.status(400).json({ message: 'Wrong password' });
      }

      // Store user information in session
      req.session.userId = user._id; 
      req.session.user = user.name; 

      return res.status(200).json({ 
          message: 'User logged in successfully',
          user: {
              _id: user._id,
              name: user.name,
              email: user.email
          }
      });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Error in login" });
  }
};

    
    export const Logout = async (req, res) => {
        try {
            // Clear cookies by setting the options
            res.clearCookie("accessToken", {
                httpOnly: true,
                sameSite: "strict",
                secure: true, // set to true if using https
                path: "/",
            });
            
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "strict",
                secure: true, // set to true if using https
                path: "/",
            });

            req.session.destroy((err) => {
              if (err) {
                return res.status(500).json({ message: "Logout failed, try again." });
              }
          
              // Optionally clear the cookie (if you are using cookies for session management)
              res.clearCookie('connect.sid', { path: '/' });
              return  res.status(200).json({ success: true, message: "Logged out successfully" });
            });
        } catch (error) {
            // Send error response
          return  res.status(500).json({ success: false, message: "Error in logout" });
        }
    };
    
// Google Auth login
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleAuthCallback = async (req, res) => {
  try {
    const { email, displayName, id: googleId } = req.user;
    console.log("Google Auth Callback - User Data:", req.user); // Log the user data here

    // Check if the user exists in the database
    let user = await User.findOne({ email });
    console.log("Checking for user in DB"); // Log this to see if it's being executed

    if (!user) {
      // Create a new user if they don't exist
      user = await User.create({
        googleId,
        email,
        name: displayName,
      });
      console.log("Created new user:", user); // Log the new user creation
    } else {
      console.log("User found in DB:", user); // Log if user already exists
    }

    req.session.userId = user._id; // Store user ID in session
    req.session.user = { id: user._id, name: user.name, email: user.email }; // Store user info in session
    console.log("Session set with user data:", req.session.user); // Log session data

    return res.redirect("https://yuviblogproject.netlify.app"); // Redirect to frontend
  } catch (error) {
    console.error("Error in Google authentication:", error); // Log any errors
    return res.status(500).json({ message: "Error in Google authentication" });
  }
};


