import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SpeechTest from './pages/SpeechTest/SpeechTest';
import Parser from './pages/Parser/parser';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <React.Fragment>
      <Router>
        <Switch>
          <Route path="/SpeechTest" component = {SpeechTest} />
          <Route path="/Parser" component ={Parser} />
        </Switch>
      </Router>
    </React.Fragment>
  );
}

export default App;
