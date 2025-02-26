import mongoose from "mongoose";
const { Schema } = mongoose;

const FriendRequestSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);

export default FriendRequest;
