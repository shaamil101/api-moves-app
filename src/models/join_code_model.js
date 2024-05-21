import mongoose, { Schema } from 'mongoose';

export const JoinCodeSchema = new Schema({
  codeId: String,
  moveId: { type: Schema.Types.ObjectId, ref: 'Move' },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const JoinCodeModel = mongoose.model('JoinCodeModel', JoinCodeSchema);

export default JoinCodeModel;
