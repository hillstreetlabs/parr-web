import React, { Component } from "react";
import { Link } from "react-router-dom";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import fetch from "isomorphic-fetch";
import styled from "react-emotion";
import logo from "../assets/images/logo.png";
import hillStreetLogo from "../assets/images/street.png";
import Spacer from "./Spacer";
import brace from "brace";
import AceEditor from "react-ace";
import KeyboardShortcuts from "./KeyboardShortcuts";

import "brace/mode/json";
import "brace/theme/tomorrow";
import "brace/theme/xcode";

const navWidth = 200;
const headerHeight = 50;

const Flex = styled("div")`
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
  flex-direction: row;
`;

const Nav = styled("div")`
  width: ${navWidth}px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  flex: none;

  & ul a {
    color: black;
  }
`;

const Column = styled("div")`
  width: calc((100% - ${navWidth}px) / 2);
  background-color: ${props => props.color};
  flex: none;
  flex-direction: column;
  display: flex;
  height: 100%;
`;

const Header = styled("div")`
  height: ${headerHeight}px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Body = styled("div")`
  height: calc(100% - ${headerHeight}px);
  overflow-y: scroll;
`;

const Logo = styled("img")`
  width: 70%;
  display: block;
`;

const Button = styled("button")`
  background-color: white;
  color: #1fccb2;
  font-size: 0.7em;
  line-height: 1.2;
  text-transform: uppercase;
  font-weight: 500;
  display: inline-block;
  cursor: pointer;
  border-radius: 0.3em;
  padding: 0.8em 1em 0.75em;
  transition: all 0.15s ease-out;
  border: none;
  box-shadow: 1px 1px 4px rgba(36, 37, 38, 0.2);

  &:hover {
    box-shadow: 2px 2px 6px rgba(36, 27, 38, 0.2);
  }
`;

const Pre = styled("pre")`
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
  padding: 10px;
`;

const Signature = styled("div")`
  display: flex;
  font-size: 14px;
  color: #444;

  & a {
    color: #444;
  }

  & img {
    width: 45px;
    height: auto;
    margin-right: 8px;
  }
`;

@observer
export default class Root extends Component {
  @observable results;
  @observable query;

  constructor(props) {
    super(props);
    this.query = JSON.stringify(this.props.recipe.default, undefined, 2);
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  @computed
  get queryIsValid() {
    try {
      JSON.parse(this.query);
      return true;
    } catch (err) {
      return false;
    }
  }

  @action
  handleChange(e) {
    this.query = e;
  }

  format() {
    this.query = JSON.stringify(JSON.parse(this.query), undefined, 2);
  }

  async submitQuery() {
    this.format();
    const response = await fetch(
      `${process.env.PARR_URL}/${this.props.recipe.api}`,
      {
        method: "POST",
        body: this.query,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    ).then(res => res.json());
    this.results = response.response;
  }

  addListeners() {
    window.addEventListener("keydown", this.handleKeyDown);
  }

  removeListeners() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = e => {
    if (e.metaKey && e.key === "Enter") this.submitQuery();
    if (e.metaKey && e.key === "p") {
      e.preventDefault();
      this.format();
    }
  };

  render() {
    return (
      <Flex>
        <Nav>
          <div>
            <Logo src={logo} />
            <Spacer />
            <ul>
              <li>
                <Link to="/editor/addresses">Addresses</Link>
              </li>
              <li>
                <Link to="/editor/blocks">Blocks</Link>
              </li>
              <li>
                <Link to="/editor/transactions">Transactions</Link>
              </li>
              <li>
                <Link to="/editor/abi">ABI Search</Link>
              </li>
            </ul>
          </div>

          <Signature>
            <div>
              <a href="https://hillstreetlabs.com" target="_blank">
                <img src={hillStreetLogo} />
              </a>
            </div>
            <div>
              We made this at{" "}
              <a href="https://hillstreetlabs.com" target="_blank">
                Hill Street Labs
              </a>.
            </div>
          </Signature>
        </Nav>
        <Column style={{ backgroundColor: "#272822" }}>
          <Header style={{ backgroundColor: "#fafafa" }}>
            <div>{this.props.recipe.title || "Code"}</div>
            <div>
              <KeyboardShortcuts />
              <Button
                onClick={() => this.submitQuery()}
                disabled={!this.queryIsValid}
              >
                Run
              </Button>
            </div>
          </Header>
          <Body>
            <AceEditor
              mode="json"
              theme="tomorrow"
              onChange={e => this.handleChange(e)}
              value={this.query}
              editorProps={{ $blockScrolling: true }}
              tabSize={2}
              width={"100%"}
              height={"100%"}
              focus={true}
            />
          </Body>
        </Column>
        <Column style={{ backgroundColor: "#E0E4EB" }}>
          <Header style={{ backgroundColor: "#CAD3DB", color: "#1C73D4" }}>
            <div>Results</div>
            {this.results && (
              <small>
                Showing <strong>{this.results.hits.length}</strong> of{" "}
                <strong>{this.results.total}</strong>
              </small>
            )}
          </Header>
          <Body>
            {this.results && (
              <AceEditor
                mode="json"
                theme="xcode"
                showGutter={false}
                value={JSON.stringify(this.results.hits, undefined, 2)}
                readOnly={true}
                width={"100%"}
                height={"100%"}
                style={{ backgroundColor: "transparent" }}
                editorProps={{ $blockScrolling: true }}
              />
            )}
          </Body>
        </Column>
      </Flex>
    );
  }
}
