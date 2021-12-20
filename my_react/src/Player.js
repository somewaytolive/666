import React, {useState, useContext, useEffect} from "react";
import {SocketContext} from "./socket";
import "./Player.css";

function Player() {
    const [cash, setCash] = useState("");
    //player owned
    const [pPapers, setpPapers] = useState([]);
    //all papers
    const [aPapers, setaPapers] = useState([]);

    //buy
    const [tPaper, settPaper] = useState("");
    const [cPaper, setcPaper] = useState("");

    //sell
    const [sPaper, setsPaper] = useState("");
    const [kPaper, setkPaper] = useState("");

    const socket = useContext(SocketContext);

    const getPPbyName = (papers, name) => {
        for (let i = 0; i < papers.length; i++) {
            if (papers[i].name === name) {
                return papers[i];
            }
        }
    };

    const buy = () => {
        socket.emit("buypaper", {
            player: localStorage["name"],
            name: tPaper,
            amount: cPaper,
        });
    };

    const sell = () => {
        socket.emit("sellpaper", {
            player: localStorage["name"],
            name: sPaper,
            amount: kPaper,
        });
    };


    useEffect(() => {
        fetch("http://localhost:3487/api/getplayer?name=" + localStorage["name"])
            .then((res) => res.json())
            .then((res) => {
                setCash(res.player.cash);
                for (let i = 0; i < res.player.papers.length; i++) {
                    let paper = getPPbyName(
                        res.papers,
                        res.player.papers[i].name
                    );
                    res.player.papers[i]["price"] = (
                        parseInt(paper.price) * parseInt(res.player.papers[i].amount)
                    ).toString();
                }
                setpPapers(res.player.papers);
            });

        socket.on("connect", () => {
            socket.emit("client_connect", {name: localStorage["name"]});
        });

        socket.on("msg", (msg) => {
            console.log(msg.message);
        });

        socket.on("market", (msg) => {
            setaPapers(msg.message);
        });
        let t = 0;
        socket.on("changeprice", (msg) => {
            console.log(msg.papers);
            setaPapers(msg.papers);
            if (t++ === 0) {
                document.getElementById("class").style.display = "block";
                document.getElementById("classter2").style.display = "block";
            }
            if (t === 9) {
                document.getElementById("class").style.display = "None";
                document.getElementById("classter2").style.display = "None";
            }
            fetch("http://localhost:3487/api/getplayer?name=" + localStorage["name"])
                .then((res) => res.json())
                .then((res) => {
                    setCash(res.player.cash);
                    for (let i = 0; i < res.player.papers.length; i++) {
                        let paper = getPPbyName(
                            res.papers,
                            res.player.papers[i].name
                        );
                        res.player.papers[i]["price"] = (
                            parseInt(paper.price) * parseInt(res.player.papers[i].amount)
                        ).toString();
                    }
                    setpPapers(res.player.papers);
                });
        });

        socket.on("mypapers", (msg) => {
            if (msg.name === localStorage["name"]) {
                console.log(msg);
                for (let i = 0; i < msg.papers.length; i++) {
                    let paper = getPPbyName(msg.all, msg.papers[i].name);
                    console.log(paper);
                    msg.papers[i]["price"] = (
                        parseInt(paper.price) * parseInt(msg.papers[i].amount)
                    ).toString();
                }
                setpPapers(msg.papers);
            }
        });
    }, [socket]);

    return (
        <div id="user">
            <div id="classter">
                <div id="classter1">
                    <h4>Cash:</h4>
                    <div id="cash">{cash}</div>
                    <h4> My papers: </h4>
                    <div id="pPapers">
                        {pPapers.map((paper) => (
                            <p>
                                Paper: {paper.name}, amount: {paper.amount}, cost: {paper.price}
                            </p>
                        ))}
                    </div>
                </div>

                <div id="classter2">
                    <h4> Papers: </h4>
                    <div id="aPapers">
                        {aPapers.map((paper) => (
                            <p>
                                Paper: {paper.name}, current price: {paper.price}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div id="class">
                <h4>Buy paper:</h4>
                <input
                    type="text"
                    value={tPaper}
                    onChange={(e) => settPaper(e.target.value)}
                    placeholder="Paper"
                ></input>
                <input
                    type="text"
                    value={cPaper}
                    onChange={(e) => setcPaper(e.target.value)}
                    placeholder="How much"
                ></input>
                <button onClick={buy}>UwU</button>
                <h4>Sell paper:</h4>
                <input
                    type="text"
                    value={sPaper}
                    onChange={(e) => setsPaper(e.target.value)}
                    placeholder="Paper"
                ></input>
                <input
                    type="text"
                    value={kPaper}
                    onChange={(e) => setkPaper(e.target.value)}
                    placeholder="How much"
                ></input>
                <button onClick={sell}>UwU</button>
            </div>
        </div>
    );
}

export default Player;
