import Move, { MoveStates } from '../models/move_model';
import submit from './submission_controller';

export async function createMove(moveInitInfo) {
  const newMove = new Move();
  newMove.creator = moveInitInfo.creator;
  newMove.responses = [];
  newMove.questions = moveInitInfo.questions;
  newMove.status = MoveStates.CLOSED;
  newMove.location = moveInitInfo.location;
  newMove.radius = moveInitInfo.radius;

  return newMove.save();
}

export async function joinMove(moveId, userInfo) {
  const move = await Move.findById(moveId);

  // make sure user's intended name does not already exist
  const newuserName = userInfo.name;
  const existingusers = move.users;

  if (existingusers.includes(newuserName)) {
    throw new Error(`user with your intended name (${newuserName}) already exists`);
  }

  if (move.status !== MoveStates.IN_PROGRESS) {
    throw new Error(`This room is not open for joining in state ${move.status}`);
  }

  // username is free; add user to room
  move.users.push(newuserName);
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
