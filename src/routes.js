import express from 'express';
import bcrypt from 'bcrypt';

import users from '../db/db.js'

// const PASSWORD_SALT = process.env.PASSWORD_SALT;

const router = express.Router();

function findByUserName(username) {
    let user;
    users.forEach((u) => {
        if(u.username === username) {
            user = u;
        }});    
    return user
}

const authenticateSession = (req, res, next) => {
    if(req.session.user) {
        next();
    } else {
        console.log("Unauthorized - invalid login attempt");
        res.status(401).send("Unauthorized - invalid login attempt");
    }
}


router.get("/", (req, res) => {
    res.send("Application started");
});

router.post("/signup", async (req, res, next) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if( !username || !password) {
            res.status(400).send("Username and password required");
            throw new Error(`missing username: ${username} or password: ${password}`);
        }

        const user = findByUserName(username);

        if(user) {
            console.log(`User with username ${username} already exists`);
            res.status(400).json(`User with username ${username} already exists.`);            
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            users.push({username: username, password: hashedPassword});
            console.log(users);
            console.log("user signup successful.");
            res.send("User signup successful");
        }        
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
            console.log("incorrect password");
            res.status(401).send("incorrect password");
        }
    } catch (err) {
        next(err);
    }
});

router.post("/addTodo", authenticateSession, (req, res, next) => {

});

router.get("/todos", authenticateSession, (req, res, next) => {

});

router.get("/protected", authenticateSession, (req, res, next) => {
    res.status(200).send("response from protected page");
})

router.get("/logout", authenticateSession, (req, res, next) => {
    req.session.destroy((error) => {
        if(error) {
            console.log("Logout failed")
            res.status(404).send("Logout failed");
            next(error);
        } else {
            res.clearCookie("connect.sid",{path: "/"});
            console.log("user session logged out");
            res.status(200).send("user session logged out");
        }
    })
})

export default router;
