var Players = require("./Players.json");
var Papers = require("./Papers.json");
var Settings = require("./Settings.json");

const bodyParser = require("body-parser");
const express = require("express");
const server = express();
port = 3487;

const cors = require("cors");
const { parse } = require("path");
const { maxHeaderSize } = require("http");
const corsOptions = {
  allowedHeaders: "Authorization,X-Requested-With,X-HTTP-Method-Override,Content-Type,Cache-Control,Accept",
  credentials: true,
  origin: true,
  methods: "GET,POST",
};
server.use(bodyParser.json());
server.use(cors(corsOptions));

server.get("/", (req, res) => {
  res.send("Yes");
});

function findPlayer(name) {
  for (let idx in Players) {
    if (Players[idx]["name"] === name) {
      return true;
    }
  }
  return false;
}

server.get("/api/login", (req, res) => {
  if (findPlayer(req.query.name)) {
    res.send(JSON.stringify({ res: true }));
  } else {
    res.send(JSON.stringify({ res: false }));
  }
});

server.get("/api/getdata", (req, res) => {
  res.send(JSON.stringify({ players: Players, papers: Papers }));
});

function findPlByName(name) {
  for (let i = 0; i < Players.length; i++) {
    if (Players[i]["name"] === name) {
      return Players[i];
    }
  }
  return Players[0];
}

server.get("/api/getplayer", (req, res) => {
  res.send(
    JSON.stringify({ player: findPlByName(req.query.name), papers: Papers })
  );
});


function changePrice(x) {
  for (let i = 0; i < Papers.length; i++) {
    Papers[i].price = Settings[parseInt(Papers[i].law)][i][(x+i)%7].price;
  }


  for (let i = 0; i < sockets.length; i++) {
    sockets[i].emit("changeprice", { papers: Papers });
  }
}

function myInter(callback, delay, repetitions) {
  var x = 0;
  var intervalID = setInterval(function () {
    callback(x);

    if (++x === repetitions) {
      clearInterval(intervalID);
    }
  }, delay);
}

server.get("/api/start", (req, res) => {
  for (let i = 0; i < sockets.length; i++) {
    sockets[i].emit("msg", { message: "Opened!!" });
    sockets[i].emit("market", { message: Papers });
  }
  
  var inter = myInter(changePrice, 3000, 7);
  
  res.send(JSON.stringify({ players: Players, papers: Papers }));
});



server.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});

function findPaperByName(name) {
  for (let i = 0; i < Papers.length; i++) {
    if (Papers[i].name === name) {
      return Papers[i];
    }
  }
  return Papers[0];
}

const http = require("http").Server(server);
const io = require("socket.io")(http, { cors: { origin: "*" } }).listen(3030);
var sockets = [];

function updatePapers(name, mypapers) {
  for (let i = 0; i < Players.length; i++) {
    if (Players[i].name === name) {
      Players[i].papers = mypapers;
    }
  }
}

io.sockets.on("connection", function (socket) {
  sockets.push(socket);
  socket.on("client_connect", (msg) => {
    socket["name"] = msg.name;
    send_back(socket, `Присоединился ${msg.name}`);
  });
  socket.on("msg", (msg) => {
    send_back(socket, `${socket["name"]} : ${msg.value}`);
  });
  socket.on("disconnect", (msg) => {
    send_back(socket, `Покинул ${socket["name"]}`);
  });

  socket.on("start", (msg) => {
    Papers = msg.papers;

    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit("msg", { message: "Opened!!" });
      sockets[i].emit("market", { message: Papers });
    }

    var inter = myInter(changePrice, 3000, 10);
  });

  socket.on("buypaper", (msg) => {
    let paper = findPaperByName(msg.name);
    let cost = parseInt(paper.price) * parseInt(msg.amount);
    let player = findPlByName(msg.player);

    if (parseInt(player.cash) >= cost) {
      player.cash = (parseInt(player.cash) - cost).toString();
      let check = false;
      for (let i = 0; i < player.papers.length; i++) {
        if (player.papers[i].name === msg.name) {
          player.papers[i].amount =
              (parseInt(player.papers[i].amount) + parseInt(msg.amount)).toString();
          check = true;
        }
      }
      if (!check) {
        player.papers.push({ name: msg.name, amount: msg.amount });
      }
    }
    updatePapers(msg.name, player.papers);

    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit("mypapers", {
        name: msg.player,
        papers: player.papers,
        all: Papers,
      });
    }
  });

  socket.on("sellpaper", (msg) => {
    let player = findPlByName(msg.player);
    let paper = findPaperByName(msg.name);
    let cost = parseInt(paper.price) * parseInt(msg.amount);


    player.cash = (parseInt(player.cash) + cost).toString();
    for(let i = 0; i < player.papers.length; i++){
      if(player.papers[i].name === msg.name){
        if (parseInt(player.papers[i].amount) - parseInt(msg.amount) >= 0)
        player.papers[i].amount = (parseInt(player.papers[i].amount) - parseInt(msg.amount)).toString();
      }
    }

    console.log(player);


    updatePapers(msg.name, player.papers);

    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit("mypapers", {
        name: msg.player,
        papers: player.papers,
        all: Papers,
      });
    }
  })

  socket.emit("hello", 'Сообщение "hello" от socket.io');
});

function send_back(socket, msg) {
  socket.emit("msg", { message: `${msg}` });
  socket.broadcast.emit("msg", { message: `${msg}` });
}
