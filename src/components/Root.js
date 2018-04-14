import React, { Component } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Editor from "./Editor";
import Landing from "./Landing";
import recipes from "../recipes";

export default class Root extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/editor/:hash" component={Editor} />
          <Route path="/editor" component={Editor} />
          <Route component={Landing} />
        </Switch>
      </BrowserRouter>
    );
  }
}
