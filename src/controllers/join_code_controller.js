import JoinCodeModel from '../models/join_code_model';
import Move from '../models/move_model';

export async function createJoinCode(joinCodeInitInfo) {
  const newJoinCode = new JoinCodeModel();
  newJoinCode.moveId = joinCodeInitInfo.moveId;

  return newJoinCode.save();
}

export async function joinMoveByCode(joinCode) {
  const moveId = await JoinCodeModel.findOne({ codeId: joinCode }).moveId;
  return moveId;
}

export async function expireCode(joinCode) {
  const existingJoinCode = await Move.findOne({ codeId: joinCode });
  const deleteJoinCode = await existingJoinCode.remove(existingJoinCode);
  return deleteJoinCode.save();
}
