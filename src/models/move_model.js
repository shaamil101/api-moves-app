import mongoose, { Schema } from 'mongoose';

export const MoveStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CANCELED: 'CANCELED',
  FINISHED: 'FINISHED',
};
const MoveSchema = new Schema({
  creator: String,
  questions: [{ prompt: String, answer: String }],
  users: [String],
  moveKey: String,
  location: {latitude: Number, longitude: Number},
  status: { type: String, enum: MoveStates, default: MoveStates.IN_PROGRESS },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const MoveModel = mongoose.model('Room', MoveSchema);

export default MoveModel;
