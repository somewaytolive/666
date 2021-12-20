import React, {useState, useContext, useEffect} from "react";
import {SocketContext} from "./socket";
import "./Admin.css";

function Admin() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [players, setPlayers] = useState([]);
    const [papers, setPapers] = useState([]);
    const socket = useContext(SocketContext);

    useEffect(() => {
        fetch("http://localhost:3487/api/getdata")
            .then((res) => res.json())
            .then((res) => {
                setPlayers(res.players);
                setPapers(res.papers);
                setIsLoaded(true);
            });

        socket.on("connect", () => {
            console.log(")))");
            socket.emit("client_connect", {name: localStorage["name"]});
        });

        socket.on("msg", (msg) => {
            console.log(msg.message);
        });
        socket.on("market", (msg) => {
            document.getElementById("startButton").hidden = true;
        });
    }, [socket]);

    const start = () => {
        socket.emit("start", {papers: papers});
    };

    const upd = (index) => (e) => {
        let newArr = [...papers];
        newArr[index].law = e.target.value;
        console.log(newArr);
        setPapers(newArr);
        console.log(papers);
    };

    if (!isLoaded) {
        return <div>Haha</div>;
    } else {
        return (
            <div id="admin">
                <button id="startButton" onClick={start}>
                    Start
                </button>
                {players.map(function (item) {
                    if (item.name !== "admin") {
                        return <p>Name: {item.name}, Cash: {item.cash} <br></br> Papers: {item.papers.map((paper) => (
                            <a> Name: {paper.name}, Amount: {paper.amount}</a>))}</p>;
                    }

                })}
                <div id="all">

                    {papers.map((paper, index) => (
                        <a class="lol">
                            {paper.name}
                            <input
                                class="imp"
                                type="text"
                                value={paper.law}
                                onChange={upd(index)}
                            ></input>
                        </a>
                    ))}

                </div>
            </div>
        );
    }
}

export default Admin;
