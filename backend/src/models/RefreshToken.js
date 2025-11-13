import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true }, // hashed token
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },
    replacedByToken: { type: String }, // store hash of replacement token
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: false }
);

// TTL index on expiresAt to auto-remove expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt.getTime();
});

RefreshTokenSchema.virtual('isActive').get(function () {
  return !this.revokedAt && Date.now() < this.expiresAt.getTime();
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
export default RefreshToken;
