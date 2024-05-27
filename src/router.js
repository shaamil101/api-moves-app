import { Router } from 'express';
import * as Moves from './controllers/move_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our project api!' });
});

// your routes will go here
const handleCreateMove = async (req, res) => {
  try {
    const result = await Moves.createMove(req.body.moveInitInfo);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleSubmitResponse = async (req, res) => {
  try {
    const result = await Moves.submitAnswer(req.body.moveId, req.body.user, req.body.response, req.body.questionId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleJoinMove = async (req, res) => {
  try {
    const result = await Moves.joinMove(req.body.code, req.body.user);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleGetQuestion = async (req, res) => {
  try {
    const result = await Moves.getQuestion(req.query.user, req.query.moveId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleGetMoveState = async (req, res) => {
  try {
    const result = await Moves.getState(req.query.moveId, req.query.user);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleChangeStatus = async (req, res) => {
  try {
    const result = await Moves.changeStatus(req.body.moveId, req.body.user, req.body.status);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleGetResults = async (req, res) => {
  try {
    const result = await Moves.getResults(req.query.moveId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

router.route('/results')
  .get(handleGetResults);

router.route('/question')
  .get(handleGetQuestion)
  .post(handleSubmitResponse);

router.route('/create')
  .post(handleCreateMove);

router.route('/join')
  .post(handleJoinMove);

router.route('/move/status')
  .get(handleGetMoveState)
  .post(handleChangeStatus);

export default router;
