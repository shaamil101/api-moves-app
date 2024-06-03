import mongoose, { Schema } from 'mongoose';

export const MoveStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CANCELED: 'CANCELED',
  FINISHED: 'FINISHED',
};
const MoveSchema = new Schema({
  creator: String,
  creatorNumber: String,
  code: String,
  questions: [{
    questionId: { type: Number },
    prompt: { type: String },
    backendPrompt: { type: String },
    gif: { type: String },
    type: { type: String },
    yesId: { type: Number },
    noId: { type: Number },
  }],
  users: [String],
  location: { latitude: Number, longitude: Number },
  radius: Number,
  status: { type: String, enum: MoveStates, default: MoveStates.IN_PROGRESS },
  moveName: String,
  results: [{
    name: String,
    photo: String,
    place_id: String,
    rating: Number,
    price_level: Number,
    distance: Number,
  }],
  userMap: {
    type: Schema.Types.Mixed,
    default: {},
  },
  completed: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const MoveModel = mongoose.model('Room', MoveSchema);

export default MoveModel;
