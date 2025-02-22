const router = require('express').Router();
const bcrypt = require("bcryptjs")
const db = require("../../data/dbConfig")
const jwt = require("jsonwebtoken")

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  const hash = bcrypt.hashSync(String(password), 8)
  if(!username || !password) {
    res.status(405).json("username and password required")
  } else if(await db("users").where("username", username).first() !== undefined) {
    res.status(405).json("username taken")
  } else {
    await db("users")
    .insert({"username": username, "password": hash})
    .then(async ([id]) => {
    const user = await db("users").where("id", id).first()
    res.status(201).json(user)
  })
}
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
  // res.end('implement login, please!');
  const { username, password } = req.body
  if(!username || !password) {
    res.status(405).json("username and password required")
  } else {
  await db("users")
    .where("username", username)
    .then(([user]) => {
      console.log(user)
      if(user && bcrypt.compareSync(password, user.password)) {
        const token = buildToken(user)
        res.status(200).json({ message: `welcome, ${username}`, token})
      } else {
        res.status(405).json("invalid credentials")
      }
    })
  } 

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
  }
  const options = {
    expiresIn: "1d"
  }
  return jwt.sign(payload, process.env.SECRET || "shh", options)
}

module.exports = router;
