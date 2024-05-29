import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user_model';

dotenv.config({ silent: true });

// Function to generate token for a user
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

export const signup = async (req, res) => {
  try {
    const { number, password } = req.body;

    if (!number || !password) {
      return res.status(422).json({ error: 'You must provide a number and password' });
    }

    // See if a user with the given number exists
    const existingUser = await User.findOne({ number });
    if (existingUser) {
      // If a user with number does exist, return an error
      return res.status(422).json({ error: 'User already exists' });
    }

    // Create a new user
    const user = new User({ number, password });
    await user.save();

    // Respond with a token for the user
    return res.json({ token: tokenForUser(user) });
  } catch (err) {
    // Handle any unexpected errors
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const signin = async (req, res) => {
  try {
    const { number, password } = req.body;

    if (!number || !password) {
      return res.status(422).json({ error: 'You must provide a number and password' });
    }

    // Find the user by number
    const user = await User.findOne({ number });
    if (!user) {
      return res.status(401).json({ error: 'Invalid number or password' });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid number or password' });
    }

    // Generate and return a token if authentication is successful
    return res.json({ token: tokenForUser(user), number: user.number });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const signout = async (req, res) => {
  try {
    // req.logout();
    return res.json({ message: 'Successfully signed out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// returns the main state with status, users, username, and move name
export async function getUserInfo(userNumber) {
  console.log('Number using to query for user info on backend:', userNumber);
  const user = await User.findOne({ number: userNumber });
  // const users = await User.find();

  // console.log('All users:', users);

  if (!user) {
    console.log('NO USER WITH THAT NUMBER');
    return null;
  }

  const state = {
    id: user.id,
    number: user.number,
    name: user.name,
    password: user.password,
    movesList: user.movesList,
    location: user.location,
    moves: user.moves,
    responses: user.responses,
    prompts: user.responses,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    friends: user.friends,
  };

  return state;
}

export async function addMove(userPhoneNumber, moveId) {
  const user = await User.findOne({ number: userPhoneNumber });

  console.log('User located: ', user);

  // Add id to map of move Ids
  user.movesList.push(moveId);

  console.log('Updated local user: ', user);

  const res = await user.save();

  return res;
}
