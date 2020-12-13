import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Workbench from '@/views/workbench';
import DelProgress from '@/components/del-progress';

const App: React.FC = function() {
  return (
    <>
      <DelProgress></DelProgress>
      <Router>
        <Switch>
          <Route path="/index" exact component={Workbench}></Route>
          <Redirect to="/index"></Redirect>
        </Switch>
      </Router>
    </>
  );
};

export default App;
