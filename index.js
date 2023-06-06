require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createPool } = require("mysql");

const app = express();

app.use(express.json());
const pool = createPool({
    host: "localhost",
    user: "root",
    password: "password"
})

let users = [];
let refreshTokens = [];



app.get("/users", (req, res) => {
    pool.query(`select * from userdb.users`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            users = result;
        }
    })
    res.json(users);
});

//Register
app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword, age: req.body.age, field: req.body.field };
        const sql = `INSERT INTO userdb.users (username, password, age, field)
               VALUES ('${req.body.username}', '${hashedPassword}', ${req.body.age}, '${req.body.field}')`;
        pool.query(sql, (err, res) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("result: " + res)
            }
        })
        res.status(201).send();
    } catch {
        res.status(500).send();
    }
});

function getUser(username, callback) {
    const sql = `select * from userdb.users where username='${username}'`;
    let user = {};
    pool.query(sql, async (err, result) => {
        if (err) {
            console.log(err);
            user = null;
        }
        else {
            //console.log("result: " + res);
            user = JSON.parse(JSON.stringify(result));
            console.log(user);

        }
    })
    console.log(user)
    callback(user);
}

//LogIn
app.post("/login", async (req, res) => {
    const sql = `select * from userdb.users where username='${req.body.username}'`;
    pool.query(sql, async (err, result) => {
        let user;
        if (err) {
            console.log(err);
            user = null;
        }
        else {
            const userObject = JSON.parse(JSON.stringify(result));
            user = userObject[0];
            if (user == null) {
                return res.status(400).send("Cannot find the user");
            }
            try {
                const passwordComparrison = await bcrypt.compare(req.body.password, user.password);
                if (passwordComparrison) {
                    const accessToken = generateAccessToken(user);
                    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                    refreshTokens.push(refreshToken)
                    res.json({ accessToken: accessToken, refreshToken: refreshToken });
                } else {
                    res.send("Not allowed");
                }
            } catch {
                res.status(500).send("oops");
            }
        }
    })
});

//Refresh token
app.post('/token', (req, res) => {
    //store in database
    const refreshToken = req.body.token;
    if (refreshToken == null) {
        return res.sendStatus(401)
    }
    if (!refreshTokens.includes(refreshToken)) {
        return res.sendStatus(403)
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        const accessToken = generateAccessToken({ username: user.username })
        res.json({ accessToken: accessToken })
    })
})

//Delete Refresh Token
app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

app.use("/", (req, res, next) => {
    return res.status(200).json({ msg: "Hello from authentication" });
});

app.listen(8001, () => {
    console.log("Authentication is listening to port 8001");
});
