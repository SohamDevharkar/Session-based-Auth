import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import users from '../db/db.js'
import session from 'express-session';

const PASSWORD_SALT = process.env.PASSWORD_SALT;

const router = express.Router();

function findByUserName(username) {
    let user;
    users.forEach((u) => {
        if(u.username == username) {
            user = u;
            return user
        }});    
        return user
}

router.get("/", (req, res) => {

});

router.post("/signup", async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if( !username || !password) {
            res.status(400).send("Username and password required");
            throw new Error(`missing username: ${username} or password: ${password}`);
        }

        for(user in users) {
            if(username === user.username) {
                console.log(`User with username ${username} already exists`);
                res.status(400).json(`User with username ${username} already exists.`)
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({username, hashedPassword})
        console.log("user signup successful.");
        res.send("User signup successful")
    } catch (err) {
        res.status(500).send(err.message);
        next(err);
    }
    
});

router.post("/signin",  async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if( !username || !password) {
            console.error(`missing username: ${username} or password: ${password}`);
            res.status(400).send("Username and password required"); 
        }

        const user = findByUserName(username);

        if(!user) {
            console.log(`user not found with username ${username}`);
            res.status(401).send(`user not found`);
        }

        const password_match = await bcrypt.compare(password, user.password);

        if(password_match) {
            req.session.regenerate(err => {
                if(err) {
                    console.error(`Error regenerating session`);
                    next(err);
                }
                req.session.user = { username: user.username };
                res.status(201).send(`logged in as ${username}`);
            });    
        } else {
            res.status(401).send("incorrect password");
        }
    } catch (err) {
        next(err);
    }
});

router.post("/addTodo", (req, res, next) => {

});

router.get("/todos", (req, res, next) => {

});

export default router;
