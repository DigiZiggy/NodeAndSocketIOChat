var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;
// var idleTimer;
users = [];
offlineUsers = [];
idleUsers = [];
connections = [];

var io = require('socket.io').listen(server, {
    pingTimeout: 2000,
    pingInterval: 10000
});

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));

io.sockets.on('connection', function(socket){
    var idleTimer; // variable persisted here

    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
        var connectionMessage = socket.username + " Disconnected from Socket " + socket.id;
        console.log(connectionMessage);
        offlineUsers.push(socket.username);
        // users.splice(users.indexOf(socket.username), 1);
        if (idleUsers.includes(socket.username)) {
            idleUsers.splice(idleUsers.indexOf(socket.username), 1);
        }
        updateUsernames();

        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    //Send message
    socket.on('send message', function(data){
        console.log(socket.username + 'sends message');
        io.sockets.emit('new message', {
            msg: data,
            user: socket.username
        });
    });

    //New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    //New Usernames with correct status
    function updateUsernames(){
        console.log("updateUsernames");

        io.sockets.emit('get users', {
            idle: idleUsers,
            allUsers: users,
            offUsers: offlineUsers
        });
    }

    socket.on('typing', function(data){
        //check whether user in idle list, if so delete from idle
        // and updateUsernames();
        if (idleUsers.includes(socket.username)) {
            idleUsers.splice(idleUsers.indexOf(socket.username), 1);
            updateUsernames();
        }

        // clear the timer on activity
        clearTimeout(idleTimer);
        // set a timer that will log off the user after 30 seconds
        idleTimer = setTimeout(function(){
            idleUsers.push(socket.username);
            updateUsernames();
        }, 30000);
        socket.broadcast.emit('typing', {user: socket.username})

    });
});
