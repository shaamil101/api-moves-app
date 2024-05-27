import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Create a UserSchema with number and password fields
const UserSchema = new Schema({
  id: { type: String },
  number: { type: String, unique: true },
  name: { type: String },
  password: { type: String },
  location: { type: Object },
  moves: {
    type: Map,
    of: { type: Schema.Types.ObjectId, ref: 'Move' }
  },
  responses: {
    type: Map,
    of: { type: Schema.Types.ObjectId, ref: 'Response' }
  },
  prompts: {
    type: Map,
    of: { type: Schema.Types.ObjectId, ref: 'Prompt' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  friends: {
    type: Map,
    of: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  timestamps: true
});

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function beforeYourModelSave(next) {
  // Reference to the user model
  const user = this;
  // If the password was not modified, proceed to the next middleware
  if (!user.isModified('password')) return next();

  try {
    // Generate a salt and hash the password with the salt
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    // Replace the plain text password with the hashed password
    user.password = hash;
    // Proceed to the next middleware
    return next();
  } catch (err) {
    // Pass any error to the next middleware
    return next(err);
  }
});

// Method to compare candidate password with the user's hashed password
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  // Compare the candidate password with the hashed password
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  return comparison;
};

// Create UserModel class from schema
const UserModel = mongoose.model('User_PN', UserSchema);

export default UserModel;
