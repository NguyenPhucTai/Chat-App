var socket = io.connect('/');

socket.on('connect', function(data){
    $("#body-chat").hide(0);
    $("#listonline").hide(0);
    $("#QLroom").hide(0);
    $("#privateChat").hide(0);
    $("#btnLogout").hide(0);
    $("#btnLeaveRoom").hide(0);
});

socket.on('wrong-syntax', function(data){
    alert(data);
});

socket.on('server-send-dk-fail', function(){
    alert("User has been existed");
});

socket.on('server-send-dk-success', function(data){
    $("#body-chat").show(0);
    $("#listonline").show(0);
    $("#QLroom").show(0);
    $("#privateChat").show(0);
    $("#btnLogout").show(0);
    $("#txtUser").hide(0);
    $("#btnLogin").hide(0);
    $("#loginTitle").hide(0);
});

socket.on('server-send-ds-users', function(data){
    $('#boxContent').html("");
    data.forEach(function(i){
        $("#boxContent").append("<div>" + i + "</div>");
    });
});

socket.on("server-send-room", function(data){
    $("#dsRoom").html("");
    data.map(function(r){
        $("#dsRoom").append('<div>'+r.name+'</div>');
    });
});

socket.on("server-send-room-socket", function(data){
    $("#roomHienTai").html(data);
});

socket.on('full-room', function(data){
    alert(data);
})

socket.on("room-ton-tai", function(){
    console.log("Room-ton-tai, goi join-room");
    
    socket.emit("join-room", $("#txtRoom").val());
})

socket.on("room-khong-co", function(){
    console.log("Room-khong-co, goi tao-room va input limited");
    var txt;
    var numUser = prompt("Input number of users:");
    if ((numUser == null || numUser == "")) {
        txt = "You must enter the number of users";
        alert(txt);
    }else if(isNaN(Number(numUser))){
        txt = "Input must be number";
        alert(txt);
    }else if(parseInt(numUser) < 2){
        txt = "Number must be 2 or more";
        alert(txt);
    }else {
        console.log("goi tao-room");
        
        socket.emit("tao-room", $("#txtRoom").val() ,numUser);
        $('#txtRoom').val("");
        $('#private').html("");
        this.reset;
    }
})

socket.on("reject-by-limited-members", function(){
    alert("This room is full")
})

socket.on("Hide-load-room", function(){
    $("#btnTaoRoom").hide(0);
    $("#btnLeaveRoom").show(0);
    
})

socket.on("Hide-leave-room", function(){
    $("#btnTaoRoom").show(0);
    $("#btnLeaveRoom").hide(0);
})

socket.on('thread', function(data){
    var control = "";
    var date = formatAMPM(new Date());
    $('#thread').append(
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+data.un+ ": " +data.nd+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+you.avatar+'" /></div>' +                                
                  '</li>'           
    );
});

socket.on("private-chat", function(data){
    var control = "";
    var date = formatAMPM(new Date());
    $('#private').append(
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                            '<p>'+data.un+ ": " +data.nd+'</p>' +
                                '<p><small>'+date+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+you.avatar+'" /></div>' +                                
                  '</li>'           
    );
});

// Code to set format for date: Internet source
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}   

$(document).ready(function() {

    $('#btnLogin').click(function(){
        socket.emit('client-send-user', $('#txtUser').val());
        $('#txtUser').val("");
    })

    $('.submit_on_enter').keydown(function(event) {
      // enter has keyCode = 13, change it if you want to use another button
      if (event.keyCode == 13) {
        var message = $('#message').val();
        socket.emit('message', message);
        this.reset;
        $('#message').val("");
        return false;
      }
    }); 
 
    $('form').submit(function(){
        var message = $('#message').val();
        socket.emit('message', message);
        this.reset;
        $('#message').val("");
        return false;
    })
    
    $('#btnChat').click(function(){
        var pmessage = $('#txtMessage').val();
        socket.emit('private-message', pmessage);
        this.reset;
        $('#txtMessage').val("");
        return false;
    });
    
    $('#txtMessage').keydown(function(event) {
        // enter has keyCode = 13, change it if you want to use another button
        if (event.keyCode == 13) {
          var pmessage = $('#txtMessage').val();
          socket.emit('private-message', pmessage);
          this.reset;
          $('#txtMessage').val("");
          return false;
        }
    }); 

    $('#btnTaoRoom').click(function(){
        console.log("click btn Load Room");
        
        if($('#txtRoom').val() == null || $('#txtRoom').val() == ""){
            alert("You must enter the room name");
        } else{
            console.log("call check-room in btnTaoRoom");
            socket.emit("check-room", $('#txtRoom').val());
        }
    });

    $('#btnLeaveRoom').click(function(){
        socket.emit("leave-room", $('#txtRoom').val());
        $('#txtRoom').val("");
        $('#private').html("");
        $('#roomHienTai').html("");
        this.reset;
    });
});