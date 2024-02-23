import './App.css';
import { Entry } from './Components/Entry';
import {Rumble} from './Components/Rumble'
import {Teams} from './Components/Teams'
import {Wrestler} from './Components/Wrestler'
import { BrowserRouter as Router, Link, Route, Switch, Routes } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Entry}/>
        <Route path="/rumble/:id" Component={Rumble}/>
        <Route path="/rumble/:id/:team" Component={Teams}/>
        <Route path="/rumble/:id/:team/:wrestlerId" Component={Wrestler}/>
      </Routes>
    </Router>
  );
}

export default App;
