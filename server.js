// Declare
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set("view engine", "ejs");
app.set("views","./views");
app.use(express.static('public'));

app.get('/', function(req, res){
    res.render('index');
})

server.listen(process.env.PORT || 3000);

// Xử lý chatbot
var arrClient = [] // Mảng chứa client
var arrRoom =[]; // Mảng chứa room
var listName =[];// Mảng chứa user name

io.on('connection', function(client){
    
    client.on('client-send-user', function(data){
        if(data != ""){
            if(listName.indexOf(data)>=0){
                client.emit('server-send-dk-fail');
            }else{
                arrClient.push(client.id)
                listName.push(data);
                client.Username = data;

                client.emit('server-send-dk-success');

                io.sockets.emit('server-send-ds-users', listName);
                console.log("Client " +data + " connected");
                
                client.emit("server-send-room", arrRoom);
                client.broadcast.emit("server-send-room", arrRoom);
                console.log("");
            }
        }else{
            client.emit("wrong-syntax", "User must have characters");
        }

    });

    client.on("disconnect", function(){
        var index = arrClient.indexOf(client.id)
        var check = false;
        arrClient.splice(index, 1);
        listName.splice(index,1);
        io.sockets.emit('server-send-ds-users', listName);
  
        var arrTempRooms = [];
        for(room in client.adapter.rooms){
            if(room.length < 15){
                arrTempRooms.push(room);
            }
        }
        var backupRoom =[];
        for(var i = 0; i < arrRoom.length; i++){
            for(var j = 0; j<arrTempRooms.length; j++){
                if(arrRoom[i].name == arrTempRooms[j]){
                    backupRoom.push(arrRoom[i]);
                }
            }
        }
        arrRoom.splice(0);
        for(var i = 0; i<backupRoom.length; i++){
            arrRoom.push(backupRoom[i]);
        }

        client.emit("server-send-room", arrRoom);
        client.broadcast.emit("server-send-room", arrRoom);
        console.log("Available Users:", listName.length);
        console.log("");
    })

    client.on('message', function(data){
        io.sockets.emit("thread", {un:client.Username, nd:data});
    });

    client.on('private-message', function(data){
        io.sockets.in(client.Phong).emit("private-chat", {un:client.Username, nd:data});
    });


    client.on('check-room', function(roomName){
        var DuplicateRoom = 0;
        for(r in client.adapter.rooms){
            if(r == roomName){
                //Chỉ cần check được số người  
                // console.log("room ton tai");
                DuplicateRoom =1;
               
            }else{
                // console.log("room khong ton tai" + r);
                //Cần tạo room mới và số lượng người 
                
            }
        }
        if(DuplicateRoom != 0){
            // console.log("run Deup = true");
            client.emit("room-ton-tai")
        }
        else{
            // console.log("run Deup = false");
            client.emit("room-khong-co")
        }    
    })

    client.on("join-room", function(data){
        //join room can phai co number
        // console.log("join-rôom")
        let filterRoom = arrRoom.filter(function(room){
            return room.name == data;
        });
        // console.log("set filterroom = data"+filterRoom);
        for(room in client.adapter.rooms){
            // console.log(room)
            if(data == room){
                if(client.adapter.rooms[data].length < client.adapter.rooms[data].limit){
                    // console.log("vao duoc")
                    client.join(room);
                    client.Phong=data;
                    client.emit("Hide-load-room");
                    client.emit("server-send-room", arrRoom);
                    client.broadcast.emit("server-send-room", arrRoom); 
            
                    client.emit("server-send-room-socket", data);

                }else{
                    // console.log(client.adapter.rooms[data].limit);
                    // console.log("khong vao duoc");
                    client.emit("reject-by-limited-members");
                    client.emit("server-send-room", arrRoom);
                    client.broadcast.emit("server-send-room", arrRoom);
                }
            }
        }
    });

    client.on("tao-room", function(data, numUser){
        //co number nhung chua luu
        // console.log("tao-room");
        var number = parseInt(numUser);    
        client.join(data);
        client.Phong=data;
        
        let newRoom = {
            'name': data,
            
            'limit': number
        }
        client.adapter.rooms[data].limit = numUser;
        arrRoom.push(newRoom);

        client.emit("Hide-load-room");
        client.emit("server-send-room", arrRoom);
        client.broadcast.emit("server-send-room", arrRoom);
        
        client.emit("server-send-room-socket", data);

    });

    client.on("leave-room", function(data){
        client.leave(data);
        client.Phong=data;
       
        var check = false;
        for(room in client.adapter.rooms){
            if(room == data){
                check = true;
            }
        }

        if(check == true){ // phong co ton tai
            client.emit("server-send-room", arrRoom);
            client.broadcast.emit("server-send-room", arrRoom);
            client.emit("Hide-leave-room");
        }else{
            client.emit("Hide-leave-room");
            let arrRoomnUpdate = arrRoom.filter( el => el.name !== data );
            arrRoom.splice(0);
            for(var i = 0; i<arrRoomnUpdate.length; i++){
                arrRoom.push(arrRoomnUpdate[i])
            }
            client.emit("server-send-room", arrRoomnUpdate);
            client.broadcast.emit("server-send-room", arrRoomnUpdate);
        }
    });
});