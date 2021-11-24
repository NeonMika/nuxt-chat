// This file is executed once when the server is started
console.log("Setting up socket.io server ...")

// create express and session middleware
const app = require('express')()
const session = require('express-session')({
    secret: 'session-secret',
    resave: true,
    saveUninitialized: true
})
// use session middleware in express
app.use(session)

// Setup a socket.io server on port 3001 that has CORS disabled (do not set this to port 3000 as port 3000 is where the nuxt dev server serves your nuxt application)
const io = require("socket.io")(3001, {
    cors: {
        // No CORS at all
        origin: 'http://localhost:3000',
        credentials: true
    }
});

io.use((socket, next) => {
    // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
    // connections, as 'socket.request.res' will be undefined in that case
    session(socket.request, {}, next)

    // console.log(`socket.io handshake: ${JSON.stringify(socket.handshake)}`)
    console.log(`socket.io handshake header cookie: ${JSON.stringify(socket.handshake.headers.cookie)}`)
    // not working console.log(`socket.io request session: ${JSON.stringify(socket.request.session.id)}`)
});

const data = {
    // key = gameName
    // value = game
    games: {}
}

const handleCreateGame = function (socket, gameName, username, callback) {
    if (data.games[gameName]) {
        callback({
            error: true,
            errorMessage: "Game already exists"
        })
    } else {
        if (!socket.request.session.games) {
            socket.request.session.games = {}
        }
        socket.request.session.games[gameName] = { gameName, username, owner: true }
        socket.request.session.save();
        data.games[gameName] = {
            "gameName": gameName,
            "users": { username: socket.request.session.games[gameName] },
            "owner": socket.request.session.games[gameName],
            "messages": [],
        }
        callback({
            error: false
        })
        io.emit("games", Object.keys(data.games))
    }
}

const handleOpen = function (socket, gameName, callback) {
    const game = data.games[gameName]
    if (game) {
        socket.join(gameName)
        if (socket.request.session.games && socket.request.session.games[gameName]) {
            callback({
                error: false,
                username: socket.request.session.games[gameName].username
            })
        } else {
            callback({
                error: false
            })
        }
        socket.emit("game", game)
    } else {
        callback({
            error: true,
            errorMessage: "Game does not exist"
        })
    }
}

const handleRegister = function (socket, gameName, username, callback) {
    const game = data.games[gameName]
    if (game) {
        socket.join(gameName)
        if (!socket.request.session.games) {
            socket.request.session.games = {}
        }
        if (!socket.request.session.games[gameName]) {
            if (!game.users[username]) {
                socket.request.session.games[gameName] = { gameName, username, owner: false }
                socket.request.session.save();
                callback({
                    error: false
                })
                game.users[username] = socket.request.session.games[gameName]
                io.to(gameName).emit("game", game)
            } else {
                callback({
                    error: true,
                    errorMessage: "Same username already used"
                })
            }
        } else {
            callback({
                error: true,
                errorMessage: "Already registered"
            })
        }
    } else {
        callback({
            error: true,
            errorMessage: "Game does not exist"
        })
    }
}

const handleChat = function (socket, gameName, username, message, callback) {
    const game = data.games[gameName]
    if (game) {
        const m = {
            username,
            message
        }
        game.messages.push(m)
        callback({
            error: false
        })
        io.to(gameName).emit("game", game)
    } else {
        callback({
            error: true,
            errorMessage: "Game does not exist"
        })
    }
}

const handleGames = function (socket, callback) {
    callback({
        error: false
    })
    socket.emit("games", Object.keys(data.games))
}

io.on("connection", (socket) => {
    console.log(`connection: ${socket.id}`)

    socket.on("createGame", (gameName, username, callback) => {
        console.log(`createGame: ${gameName} ${username}`)
        handleCreateGame(socket, gameName, username, callback)
    })

    socket.on("open", (gameName, callback) => {
        console.log(`open: ${gameName}`)
        handleOpen(socket, gameName, callback)
    })

    socket.on("register", (gameName, username, callback) => {
        console.log(`register: ${gameName} ${username}`)
        handleRegister(socket, gameName, username, callback)
    })

    socket.on("chat", (gameName, username, message, callback) => {
        console.log(`chat: ${gameName} ${username} ${message}`)
        handleChat(socket, gameName, username, message, callback)
    })

    socket.on("games", (callback) => {
        console.log(`games`)
        handleGames(socket, callback)
    })
});

io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
})

io.of("/").adapter.on("delete-room", (room) => {
    console.log(`room ${room} was deleted`);
})

io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
})

io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`socket ${id} has left room ${room}`);
})

console.log("socket.io server set up ...")

export default app