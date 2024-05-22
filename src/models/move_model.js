import mongoose, { Schema } from 'mongoose';

export const MoveStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CANCELED: 'CANCELED',
  FINISHED: 'FINISHED',
};
const MoveSchema = new Schema({
  creator: String,
  joinCode: Number,
  questions: { questionId: Number, prompt: String },
  questionsByUser: [{ user: String, questionId: Number }],
  users: [String],
  location: { latitude: Number, longitude: Number },
  radius: Number,
  status: { type: String, enum: MoveStates, default: MoveStates.IN_PROGRESS },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const MoveModel = mongoose.model('Room', MoveSchema);

export default MoveModel;
