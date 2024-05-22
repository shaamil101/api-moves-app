import { Router } from 'express';
import * as Moves from './controllers/move_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our project api!' });
});

// your routes will go here
const handleCreateMove = async (req, res) => {
  try {
    const result = await Moves.createMove(req.body);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleJoinMove = async (req, res) => {
  try {
    const result = await Moves.joinMove(req.params.code, req.body.user);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

const handleGetQuestion = async (req, res) => {
  try {
    const result = await Moves.getQuestion(req.params.user, req.params.moveId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

router.route('/question')
  .get(handleGetQuestion);

router.route('/create')
  .post(handleCreateMove);

router.route('/create/:code')
  .post(handleJoinMove);

export default router;
