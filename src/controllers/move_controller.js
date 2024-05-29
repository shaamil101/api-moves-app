import Move, { MoveStates } from '../models/move_model';
import Submission from '../models/submission_model';
import submit from './submission_controller';
import { createJoinCode, joinMoveByCode } from './join_code_controller';
import data from '../../static/questions.json';
import getResultJson from '../main_algo';

export async function createMove(moveInitInfo) {
  const newMove = new Move();
  newMove.creator = moveInitInfo.creator;
  newMove.creatorNumber = moveInitInfo.creatorNumber;
  newMove.responses = [];
  const questions = Object.keys(data).map((key) => {
    return {
      questionId: parseInt(key, 10),
      prompt: data[key].prompt,
      backendPrompt: data[key].backendPrompt,
      gif: data[key].gif,
      type: data[key].type,
      yesId: data[key].yesId,
      noId: data[key].noId,
    };
  });
  newMove.questions = questions;
  newMove.status = MoveStates.IN_PROGRESS;
  newMove.location = moveInitInfo.location;
  newMove.radius = moveInitInfo.radius;
  newMove.users = [moveInitInfo.creator];
  newMove.moveName = moveInitInfo.moveName;

  async function generateUniqueJoinCode() {
    let joinCode;
    let codeExists = true;

    while (codeExists) {
      joinCode = Math.floor(100000 + Math.random() * 900000);
      // eslint-disable-next-line no-await-in-loop
      codeExists = await Move.findOne({ joinCode }); // Assuming Move.findOne returns a Promise
    }

    return joinCode;
  }

  const move = await newMove.save();

  const sub = new Submission();
  sub.questionId = 1;
  sub.user = moveInitInfo.creator;
  sub.moveId = move._id;
  await sub.save();
  const joinCode = await generateUniqueJoinCode();

  await createJoinCode({ joinCode, moveId: move._id });

  return { joinCode, moveId: move._id };
}

export async function getResults(moveId) {
  const move = await Move.findById(moveId).lean();
  const submissions = await Submission.find({ moveId }).lean();
  const { location, radius } = move;
  const results = [];
  for (let i = 0; i < submissions.length; i += 1) {
    for (let j = 0; j < submissions[i].responses.length; j += 1) {
      const { questionId, answer } = submissions[i].responses[j];
      const { backendPrompt } = move.questions.find((q) => { return q.questionId === parseInt(questionId, 10); });
      results.push(`${backendPrompt}: ${answer}`);
    }
  }
  const res = await getResultJson(results, location, radius);
  console.log(res);
  return res;
}

export async function joinMove(joinCode, user) {
  const moveId = await joinMoveByCode(joinCode);
  const move = await Move.findById(moveId);

  const sub = new Submission();
  sub.questionId = 1;
  sub.user = user;
  sub.moveId = moveId;
  await sub.save();

  // make sure user's intended name does not already exist
  const userName = user;
  const existingusers = move.users;

  if (existingusers.includes(userName)) {
    throw new Error(`user with your intended name (${userName}) already exists`);
  }

  if (move.status !== MoveStates.IN_PROGRESS) {
    throw new Error(`This room is not open for joining in state ${move.status}`);
  }

  // username is free; add user to room
  move.users.push(userName);
  return move.save();
}

export async function changeStatus(moveId, userId, status) {
  const move = await Move.findById(moveId);

  if (status in MoveStates) {
    move.status = status;
  } else if (userId !== move.creator) {
    throw new Error('Only the creator can change the status of the game');
  } else {
    throw new Error(`Invalid status. Must be ${MoveStates.CANCELLED}, ${MoveStates.IN_PROGRESS} or ${MoveStates.FINISHED}`);
  }

  const res = await move.save();

  return res;
}

// returns the main state with status, users, username, and move name
export async function getState(moveId, user) {
  const move = await Move.findById(moveId);

  const state = {
    id: moveId,
    status: move.status,
    users: move.users,
    yourName: user,
    creator: move.creator,
    creatorNumber: move.creatorNumber,
    moveName: move.moveName,
  };

  return state;
}

// submit an answer to a room's current question
export async function submitAnswer(moveId, user, response, questionId) {
  const move = await Move.findById(moveId);

  if (move.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!move.users.includes(user)) {
    throw new Error(`user (${user}) not in move`);
  }

  const submission = await Submission.findOne({ moveId, user });

  await submit(moveId, user, questionId, response);

  // get next question id
  let nextQuestionId;
  if (response) {
    nextQuestionId = move.questions.find((q) => { return q.questionId === questionId; }).yesId;
  } else {
    nextQuestionId = move.questions.find((q) => { return q.questionId === questionId; }).noId;
  }

  submission.questionId = nextQuestionId;
  await submission.save();

  await move.save();

  return { moveId, user, questionId: nextQuestionId };
}

export async function getQuestion(user, moveId) {
  const move = await Move.findById(moveId);
  const submission = await Submission.findOne({ moveId, user });
  if (!submission) {
    throw new Error(`Move with ID ${moveId} not found`);
  }
  const { questionId } = submission;
  const questionData = move.questions.find((entry) => { return entry.questionId === questionId; });
  if (!questionData) {
    return { questionId, prompt: '' };
  }
  return { questionId, prompt: questionData.prompt };
}
