import "./App.css";
import Admin from "./Admin";
import {SocketContext, socket} from './socket';
import Player from "./Player";

import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";

import Login from "./Login";

function App() {
  return (
    <SocketContext.Provider value={socket}>
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/player" element={<Player />} />
          <Route exact path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </div>
    </SocketContext.Provider>
  );
}

export default App;
