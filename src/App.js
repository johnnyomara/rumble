import './App.css';
import { Entry } from './Components/Entry';
import {Rumble} from './Components/Rumble'
import { BrowserRouter as Router, Link, Route, Switch, Routes } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Entry}/>
        <Route path="/rumble/:id" Component={Rumble}/>
      </Routes>
    </Router>
  );
}

export default App;
