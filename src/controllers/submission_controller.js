import Submission from '../models/submission_model';

// new answer submission
export default async function submit(moveId, user, questionId, response) {
  const exisitingSubmission = await Submission.findOne({
    moveId, user,
  });
  if (!exisitingSubmission) {
    const firstResponse = { questionId, response };
    const newSubmission = new Submission({
      moveId,
      user,
      responses: [firstResponse],
      questionId,
    });
    newSubmission.questionId += 1;
    await newSubmission.save();
    return newSubmission;
  } else {
    exisitingSubmission.responses.push({ questionId, response });
    exisitingSubmission.questionId += 1;
    await exisitingSubmission.save();
    return exisitingSubmission;
  }
}
