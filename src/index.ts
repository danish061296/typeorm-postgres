import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express, { Request, Response } from 'express';
import { validate } from 'class-validator';

import { User } from './entity/User';
import { Post } from './entity/Post';

const app = express();
// middlewares
app.use(express.json());

// CRUD express routes
// Create table user and insert user data into the table
app.post('/users', async (req: Request, res: Response) => {
  const { name, email, role } = req.body;

  try {
    const user = User.create({ name, email, role });

    const errors = await validate(user);
    if (errors.length > 0) throw errors;

    // save user to database
    await user.save();
    return res
      .status(200)
      .json({ user: user, message: ' User account was created successfully.' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ err: err, message: "Error: Couldn't create the user." });
  }
});

// get all the users
app.get('/users', async (_: Request, res: Response) => {
  try {
    // get all users
    const users = await User.find();
    // if we want to fetch all posts for the users
    // const posts = await User.find({relations: ['posts']});

    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//Update user info
app.put('/users/:uuid', async (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  const { name, email, role } = req.body;

  try {
    const user = await User.findOneOrFail({ uuid: uuid });

    // if new name, then update or keep the same name
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // update users table with new user info
    await user.save();

    return res.json({ user: user, message: 'User info updated successfully' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error: Couldn't update the user info." });
  }
});

// delete user by id
app.delete('/users/:uuid', async (req: Request, res: Response) => {
  const uuid = req.params.uuid;

  try {
    const user = await User.findOneOrFail({ uuid: uuid });

    // if user, then delete
    await user.remove();

    return res.json({ message: 'User was deleted successfully' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error: Couldn't update the user info." });
  }
});

// find user by id
app.get('/users/:uuid', async (req: Request, res: Response) => {
  const uuid = req.params.uuid;

  try {
    // find user by id
    const user = await User.findOneOrFail({ uuid: uuid });

    // return that user
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ message: "Error: Couldn't find the user with that id." });
  }
});

// create posts
app.post('./posts', async (req: Request, res: Response) => {
  const { userUuid, title, body } = req.body;
  try {
    // get user with the uuid
    const user = await User.findOneOrFail({ uuid: userUuid });

    const post = new Post({ title, body, user });

    await post.save();
    return res.json(post);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error: Couldn't create the post." });
  }
});

// get all posts by a user
app.get('./posts', async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ relations: ['user'] });

    return res.json(posts);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error: Couldn't create the post." });
  }
});

createConnection()
  .then(async () => {
    app.listen(3001, () => console.log('Server running at port 3001'));
  })
  .catch((error) => console.log(error));
