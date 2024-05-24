import mongoose, { Schema } from 'mongoose';

export const JoinCodeSchema = new Schema({
  codeId: { type: Number, required: true },
  moveId: { type: String, required: true },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const JoinCodeModel = mongoose.model('JoinCodeModel', JoinCodeSchema);

export default JoinCodeModel;
