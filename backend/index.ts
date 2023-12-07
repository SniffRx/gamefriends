import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express()
const port = process.env.PORT

// Middleware
app.use(bodyParser.json());

// Mock user database
const users = [
  {
    id: 1,
    email: 'test@example.com',
    password: '$2y$04$.lMF8/e6K/UYHjxGyXxzUOAsL3Y4UfHmqDlxoGUATv82F26oDXQQG', // bcrypt hash of "password"
  },
];

// Login route
app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).send('User not found');
  }

  // Compare password
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(401).send('Invalid password');
  }

  // Create JWT token
  const token = jwt.sign({ userId: user.id }, 'secret');

  res.send({ token });
});

// Profile route
app.get('/profile', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token!, 'secret');

    // Find user by ID
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.send(`Welcome ${user.email}!`);
  } catch (err) {
    res.status(401).send('Invalid token');
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});