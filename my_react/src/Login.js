import "./Login.css";

import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

function Login() {

    const nav = useNavigate();
    const [name, setName] = useState("");

    const login = () => {
        fetch("http://localhost:3487/api/login?name=" + name)
            .then((res) => res.json())
            .then((res) => {
                if (res.res) {
                    localStorage["name"] = name;
                    if (name === "admin") {
                        nav("/admin");
                    } else {
                        nav("/player");
                    }
                }
            });
    };
    return (
        <div id="login">
            <input
                type="text"
                placeholder="Touch me"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={login}>UwU</button>
        </div>
    );
}

export default Login;
