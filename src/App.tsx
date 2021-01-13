import React from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Workbench from '@/views/workbench';
import DelProgress from '@/components/del-progress';
import DelLoading from '@/components/del-loading';

const App: React.FC = function() {
  return (
    <>
      <DelProgress />
      <DelLoading />
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
