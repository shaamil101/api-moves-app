import Move, { MoveStates } from '../models/move_model';
import submit from './submission_controller';
import { createJoinCode, joinMoveByCode } from './join_code_controller';

export async function createMove(moveInitInfo) {
  const newMove = new Move();
  newMove.creator = moveInitInfo.creator;
  newMove.responses = [];
  newMove.questions = []; // moveInitInfo.questions;
  newMove.status = MoveStates.IN_PROGRESS;
  newMove.location = moveInitInfo.location;
  newMove.radius = moveInitInfo.radius;
  newMove.users.push(moveInitInfo.creator);
  newMove.questionsByUser.push( { user: moveInitInfo.creator, questionId: 0} );

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

  const joinCode = await generateUniqueJoinCode();

  createJoinCode({ joinCode, moveId: move._id });

  return { joinCode, moveId: move._id };
}

export async function joinMove(joinCode, user) {
  const moveId = joinMoveByCode(joinCode);
  const move = await Move.findById(moveId);

  // make sure user's intended name does not already exist
  const userName = user;
  const existingusers = move.users;

  if (existingusers.includes(userName)) {
    throw new Error(`user with your intended name (${userName}) already exists`);
  }

  if (move.status !== MoveStates.IN_PROGRESS) {
    throw new Error(`This room is not open for joining in state ${move.status}`);
  }

  move.questionsByUser.push( { user: userName, questionId: 0} );

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

  return move.save();
}

// returns the main game state with current question, rank, game status, and scoreboard
export async function getState(moveId, user) {
  const move = await Move.findById(moveId);

  const state = {
    moveId,
    status: move.status,
    users: move.users,
    yourName: user,
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

  const submission = await submit(moveId, user, questionId, response);

  // TODO later on add in logic to dynamically pick next id based off answer

  await move.save();

  return submission;
}

export async function getQuestion(user, moveId) {
  const move = await Move.findById(moveId);
  if (!move.users.includes(user)) {
    throw new Error(`user (${user}) not in move`);
  }
  const questionId = move.questionsByUser.find(entry => entry.user === user).questionId;
  const prompt = 'Filler Prompt'; //questions.find(entry => entry.questionId === questionId).prompt;
  return {questionId: questionId, prompt: prompt };
}