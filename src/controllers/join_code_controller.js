import JoinCodeModel from '../models/join_code_model';
import Move from '../models/move_model';
import { joinMove } from './move_controller';

export async function createJoinCode(joinCodeInitInfo) {
  const newJoinCode = new JoinCodeModel();
  newJoinCode.moveId = joinCodeInitInfo.moveId;

  return newJoinCode.save();
}

export async function joinMoveByCode(joinCode, userInfo) {
  const moveId = await JoinCodeModel.findOne({ code_id: joinCode }).moveId;
  const useCodeToJoinMove = await joinMove(moveId, userInfo);
  return useCodeToJoinMove.save();
}

export async function expireCode(joinCode) {
  const existingJoinCode = await Move.findOne({ code_id: joinCode });
  const deleteJoinCode = await existingJoinCode.remove(existingJoinCode);
  return deleteJoinCode.save();
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