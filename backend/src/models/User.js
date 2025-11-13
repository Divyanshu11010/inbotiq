import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin'], default: 'User' },
    // Refresh tokens are stored in a separate collection `RefreshToken`.
  },
  { timestamps: true }
);

// Instance helpers
// Keep User model focused on user data. Refresh tokens are managed
// by the separate RefreshToken model and service.

const User = mongoose.model('User', UserSchema);
export default User;
