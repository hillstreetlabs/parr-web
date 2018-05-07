import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import fetch from "isomorphic-fetch";
import styled from "react-emotion";
import logo from "../assets/images/logo.png";
import Spacer from "./Spacer";

const Flex = styled("div")`
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
`;

const Container = styled("div")`
  width: 100%;
  overflow-y: scroll;
  padding: 30px;

  ${props =>
    props.grey &&
    `
    background-color: #E0E4EB;
  `};
`;

const Logo = styled("img")`
  height: 80px;
`;

const Button = styled("button")`
  font-size: 1.3em;
  padding: 1em 0.8em;
  background-color: #e0e4eb;
  color: #333;
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 3px;
  transition: all 0.15s;

  &:hover {
    border-color: #bbb;
    background-color: #e7ebf2;
    color: black;
  }

  &:active {
    border-bottom: 1px solid #ccc;
    transform: translate(0px, 1px);
  }
`;

@observer
export default class Root extends Component {
  @observable query = JSON.stringify({ query: { match_all: {} } });
  @observable results;

  @action
  handleChange(e) {
    this.query = e.target.value;
  }

  get formattedQuery() {
    let json;
    try {
      json = JSON.parse(this.query);
    } catch (err) {
      return false;
    }
    return JSON.stringify(json, undefined, 2);
  }

  async submitQuery() {
    const response = await fetch(`${process.env.PARR_URL}/addresses`, {
      method: "POST",
      body: this.query,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then(res => res.json());
    this.results = response;
  }

  render() {
    return (
      <Container>
        <Logo src={logo} />
        <h1 style={{ fontWeight: 300 }}>
          A query tool for the Ethereum blockchain.
        </h1>
        <Spacer />
        <Link to="/editor">
          <Button>Try it out &rarr;</Button>
        </Link>
      </Container>
    );
  }
}
