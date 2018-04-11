import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
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
  width: 50%;
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

@observer
export default class Root extends Component {
  @observable query = JSON.stringify({ query: {} });
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
    const response = await fetch(`${process.env.PARR_URL}/blocks`, {
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
      <Flex>
        <Container>
          <Logo src={logo} />
          <h1 style={{ fontWeight: 300 }}>
            A query tool for the Ethereum blockchain.
          </h1>
          <Spacer />
          <p>Enter JSON query:</p>
          <textarea onChange={e => this.handleChange(e)} value={this.query} />
          <p>Formatted JSON</p>
          <pre>{this.formattedQuery || "Invalid JSON"}</pre>
          <button
            onClick={() => this.submitQuery()}
            disabled={!this.formattedQuery}
          >
            Submit
          </button>
          <Spacer size={3} />
          <p>
            We made this at{" "}
            <a href="https://hillstreetlabs.com" target="_blank">
              Hill Street Labs
            </a>.
          </p>
        </Container>
        <Container grey>
          {this.results && (
            <div>
              <p>Results:</p>
              <pre>{JSON.stringify(this.results, undefined, 2)}</pre>
            </div>
          )}
        </Container>
      </Flex>
    );
  }
}
