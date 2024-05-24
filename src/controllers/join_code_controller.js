import JoinCodeModel from '../models/join_code_model';
import Move from '../models/move_model';

export async function createJoinCode(joinCodeInitInfo) {
  const newJoinCode = new JoinCodeModel({
    moveId: joinCodeInitInfo.moveId,
    codeId: joinCodeInitInfo.joinCode,
  });
  const res = await newJoinCode.save();
  return res;
}

export async function joinMoveByCode(joinCode) {
  const joinCodeObj = await JoinCodeModel.findOne({ codeId: Number(joinCode) });
  return joinCodeObj.moveId;
}

export async function expireCode(joinCode) {
  const existingJoinCode = await Move.findOne({ codeId: joinCode });
  const deleteJoinCode = await existingJoinCode.remove(existingJoinCode);
  return deleteJoinCode.save();
}
