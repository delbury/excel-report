import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Workbench from '@/views/workbench';

const App: React.FC = function() {
  return (
    <Router>
      <Switch>
        <Route path="/index" exact component={Workbench}></Route>
        <Redirect to="/index"></Redirect>
      </Switch>
    </Router>
  );
};

export default App;
