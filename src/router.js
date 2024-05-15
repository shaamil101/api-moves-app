import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our project api!' });
});

// your routes will go here

export default router;
