var message = document.getElementById('message');
$(function(){
    var socket = io.connect();
    var $loginPage = $('.login.page'); // The login page
    var $messageForm = $('#messageForm');
    var $message = $('#message');
    var $chat = $('#chat');
    var $messageArea = $('#messageArea');
    var $userFormArea = $('#userFormArea');
    var $userForm = $('#userForm');
    var $users = $('#users');
    var $username = $('#username');
    var $feedback = document.getElementById('feedback');
    var $colors = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];


    message.addEventListener('keypress', function(){
        socket.emit('typing', $username.val());
    });

    socket.on('typing', function(data){
        $feedback.innerHTML = '<p><em>' + data.user +'is typing a message...</em></p>';
    });

    $messageForm.submit(function(e){
        e.preventDefault();
        console.log('Submitted');
        socket.emit('send message', $message.val());
        $message.val('');
    });

    socket.on('new message', function(data){
        $feedback.innerHTML = "";
        var $userColor;
        $userColor = getUsernameColor(data.user);
        $chat.append('<div class="well"><strong style="color: ' + $userColor +'">' + data.user + ': ' + '</strong>' + data.msg + '</div>');
    });

    $userForm.submit(function(e){
        e.preventDefault();
        socket.emit('new user', $username.val(), function(data){
            if(data){
                $userFormArea.hide();
                $messageArea.show();
            }
        });
        $username.val('');
    });

    socket.on('get users', function(data){
        console.log("going to client get users");
        var html = '';
        var i;
        for (i = 0; i < data.allUsers.length; i++) {
            if (data.idle.includes(data.allUsers[i])) {
                html += '<li class="list-group-item">' + data.allUsers[i] + '  <span class="dot" style="background-color: #FFBD00;"></span></li>';
            } else if (data.offUsers.includes(data.allUsers[i])){
                html += '<li class="list-group-item">' + data.allUsers[i] + '  <span class="dot" style="background-color: #EE0000;"></span></li>';
            } else {
                html += '<li class="list-group-item">' + data.allUsers[i] + '  <span class="dot" style="background-color: #008B00;"></span></li>'
            }
            console.log("changing users html");
        }
        $users.html(html);
    });

    socket.on('disconnect', function () {
        alert('You have been logged out due to inactivity!');
        $messageArea.hide();
        $userFormArea.show();
    });


    // Gets the color of a username through our hash function
    function getUsernameColor (username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % $colors.length);
        return $colors[index];
    }
});