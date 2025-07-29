import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import User from '../models/User.mjs';

// Function to initialize Google OAuth strategy
const initializeGoogleStrategy = () => {
  // Check if Google OAuth credentials are available
  const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

  if (hasGoogleCredentials) {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || 'https://news-vzdx.onrender.com'}/api/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if profile has email
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('Google profile missing email:', profile);
          return done(new Error('No email found in Google profile'), null);
        }

        const email = profile.emails[0].value;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
          // Update existing user with Google ID and profile image if not present
          let updated = false;
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            updated = true;
          }
          if (!existingUser.profileImage && profile.photos && profile.photos[0]) {
            existingUser.profileImage = profile.photos[0].value;
            updated = true;
          }
          if (updated) {
            await existingUser.save();
          }
          return done(null, existingUser);
        }
        
        // Create new user with unique username
        let username = profile.displayName || email.split('@')[0];
        let counter = 1;
        
        // Check if username exists and generate unique one
        while (await User.findOne({ username })) {
          username = `${profile.displayName || email.split('@')[0]}_${counter}`;
          counter++;
        }
        
        const newUser = await User.create({
          username,
          email,
          googleId: profile.id,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          role: 'user'
        });
        
        return done(null, newUser);
      } catch (error) {
        console.error('Error in Google OAuth strategy:', error);
        return done(error, null);
      }
    }));
    
    console.log('✅ Google OAuth strategy initialized successfully');
  } else {
    console.warn('⚠️  Google OAuth credentials not found. Google OAuth will be disabled.');
    console.warn('   Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
  }
};

// Export the initialization function
export const initializeGoogleOAuth = initializeGoogleStrategy;

// Initialize Google strategy if environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  initializeGoogleStrategy();
}

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 