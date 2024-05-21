import mongoose, { Schema } from 'mongoose';

export const JoinCodeSchema = new Schema({
  code_id: String,
  moveId: { type: Schema.Types.ObjectId, ref: 'Move' },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const JoinCodeModel = mongoose.model('Submission', JoinCodeSchema);

export default JoinCodeModel;
