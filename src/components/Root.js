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
          <Route path="/editor">
            <Switch>
              {recipes.map(recipe => (
                <Route
                  key={recipe.route}
                  path={`/editor/${recipe.route}`}
                  render={props => <Editor recipe={recipe} {...props} />}
                />
              ))}
              <Redirect to="/editor/addresses" />
            </Switch>
          </Route>
          <Route component={Landing} />
        </Switch>
      </BrowserRouter>
    );
  }
}
