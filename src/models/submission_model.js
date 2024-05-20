import mongoose, { Schema } from 'mongoose';

export const SubmissionSchema = new Schema({
  moveId: { type: Schema.Types.ObjectId, ref: 'Move' },
  user: { type: String, required: true },
  responses: [{ questionId: String, answer: Boolean }],
  questionId: { type: Number, required: true },
}, {
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const SubmissionModel = mongoose.model('Submission', SubmissionSchema);

export default SubmissionModel;
