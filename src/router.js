import { Router } from 'express';
import * as Moves from './controllers/move_controller';
import { requireAuth, requireSignin } from './services/passport';
import * as UserController from './controllers/user_controller';

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
    const result = await Moves.getState(req.query.moveId);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error });
  }
};

router.route('/question')
  .get(handleGetQuestion)
  .post(handleSubmitResponse);

router.route('/create')
  .post(handleCreateMove);

router.route('/join')
  .post(handleJoinMove);

router.route('/move/status')
  .get(handleGetMoveState);

// Signin route
router.post('/signin', requireSignin, async (req, res) => {
  await UserController.signin(req, res);
});

// Signup route
router.post('/signup', async (req, res) => {
  await UserController.signup(req, res);
});

// Signout route
router.post('/signout', async (req, res) => {
  await UserController.signout(req, res);
});

export default router;
