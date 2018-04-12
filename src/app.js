import React from "react";
import ReactDOM from "react-dom";
import Root from "./components/Root";
import { injectGlobal } from "emotion";

injectGlobal`
  body {
    margin: 0;
    font-family: 'Fira Sans', sans-serif;
    font-weight: 400;
  }

  div {
    box-sizing: border-box;
  }

  a,
  button {
    cursor: pointer;

    &:focus,
    &:active {
      outline: none;
    }
  }
`;

let rootElement = document.getElementById("app");

window.onload = () => {
  ReactDOM.render(<Root />, rootElement);
};

if (module.hot) {
  module.hot.accept(["./components/Root", "./app"], () => {
    ReactDOM.render(<Root />, rootElement);
  });
}
