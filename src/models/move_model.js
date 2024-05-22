import mongoose, { Schema } from 'mongoose';

export const MoveStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CANCELED: 'CANCELED',
  FINISHED: 'FINISHED',
};
const MoveSchema = new Schema({
  creator: String,
  questions: [{
    questionId: { type: Number },
    prompt: { type: String },
    right: { type: Number },
    left: { type: Number },
  }],
  users: [String],
  location: { latitude: Number, longitude: Number },
  radius: Number,
  status: { type: String, enum: MoveStates, default: MoveStates.IN_PROGRESS },
  moveName: String,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const MoveModel = mongoose.model('Room', MoveSchema);

export default MoveModel;
