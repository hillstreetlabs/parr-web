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
import FormattedResult from "./FormattedResult";

import "brace/mode/json";
import "brace/theme/tomorrow";
import "brace/theme/xcode";

const NAV_WIDTH = 200;
const HEADER_HEIGHT = 50;
const QUERY_SIZE = 10;

const Flex = styled("div")`
  display: flex;
  position: fixed;
  width: 100%;
  height: 100%;
  flex-direction: row;
`;

const Nav = styled("div")`
  width: ${NAV_WIDTH}px;
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
  width: calc((100% - ${NAV_WIDTH}px) / 2);
  background-color: ${props => props.color};
  flex: none;
  flex-direction: column;
  display: flex;
  height: 100%;
`;

const Header = styled("div")`
  height: ${HEADER_HEIGHT}px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Body = styled("div")`
  height: calc(100% - ${HEADER_HEIGHT}px);
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

const ResultsFormatLink = styled("a")`
  text-decoration: ${props => (props.selected ? "underline" : "none")};

  &:hover {
    text-decoration: underline;
  }
`;

@observer
export default class Editor extends Component {
  @observable results;
  @observable query = "";
  @observable api = "blocks_transactions";
  @observable isLoading = false;
  @observable isError = false;
  @observable showFormattedResults = true;
  @observable from = 0;
  loadedHash = null;

  componentDidMount() {
    this.loadFromHash();
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  componentDidUpdate(oldProps) {
    // Load from hash if this hash is different
    if (this.loadedHash !== this.hash) {
      this.loadFromHash();
    }
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

  @computed
  get hasNextPage() {
    const { hits } = this.results;
    return hits.hits.length > 0 && this.from + hits.hits.length < hits.total;
  }

  @computed
  get hasPreviousPage() {
    return this.results.hits.hits.length > 0 && this.from > 0;
  }

  @action
  goToNextPage() {
    const jsonQuery = JSON.parse(this.query);
    jsonQuery.from = (jsonQuery.from || 0) + (jsonQuery.size || QUERY_SIZE);
    this.query = JSON.stringify(jsonQuery, undefined, 2);
    this.submitQuery();
  }

  @action
  goToPreviousPage() {
    const jsonQuery = JSON.parse(this.query);
    jsonQuery.from = Math.max(
      (jsonQuery.from || 0) - (jsonQuery.size || QUERY_SIZE),
      0
    );
    this.query = JSON.stringify(jsonQuery, undefined, 2);
    this.submitQuery();
  }

  @action
  toggleFormattedResults() {
    this.showFormattedResults = !this.showFormattedResults;
  }

  @action
  handleChange(e) {
    this.query = e;
  }

  format() {
    this.query = JSON.stringify(JSON.parse(this.query), undefined, 2);
  }

  async saveHash() {
    const {
      query: { hash, api }
    } = await fetch(`${process.env.PARR_URL}/queries`, {
      method: "POST",
      body: JSON.stringify({
        query: this.query,
        api: this.api
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then(res => res.json());
    this.loadedHash = hash;
    if (this.hash !== hash) this.props.history.push(`/editor/${hash}`);
  }

  async loadFromHash() {
    this.loadedHash = this.hash;

    if (!this.hash) {
      this.query = "";
      return;
    }

    this.isLoading = true;
    const response = await fetch(
      `${process.env.PARR_URL}/queries/${this.hash}`
    ).then(res => res.json());
    this.isLoading = false;

    if (response.query) {
      const {
        query: { query, api, hash }
      } = response;
      // Make sure this request isn't stale
      if (this.hash !== hash) return;

      this.query = query;
      this.api = api;
    } else {
      // Not found
      this.props.history.replace("/editor");
    }
  }

  async submitQuery() {
    gtag("event", "search"); // Tracking
    this.format();
    this.saveHash();
    const response = await fetch(`${process.env.PARR_URL}/${this.api}`, {
      method: "POST",
      body: this.query,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    }).then(res => {
      this.isError = res.status !== 200;
      return res.json();
    });
    this.results = response.response;
    this.from = JSON.parse(this.query).from || 0;
  }

  changeAPI(api) {
    this.api = api;
    this.saveHash();
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
    if (e.metaKey && e.key === "s") {
      e.preventDefault();
      this.format();
      this.saveHash();
    }
  };

  get hash() {
    return this.props.match.params.hash;
  }

  render() {
    return (
      <Flex>
        <Nav>
          <div>
            <Logo src={logo} />
            <Spacer />
            <ul>
              <li>
                <Link to="/editor/e8b7d48aed65a8e67656bceecb528cc4c73611e1">
                  Addresses
                </Link>
              </li>
              <li>
                <Link to="/editor/6953fa72c4ee94652730870a21363ef70435c8a4">
                  Blocks
                </Link>
              </li>
              <li>
                <Link to="/editor/60ee0e07e3305dedcd36930e576542c506bc78e0">
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/editor/d4f5261eb21a03569466c4096d0f7d9cec496a75">
                  ABI Search
                </Link>
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
            <div>
              Query
              <Spacer inline small />
              <select
                disabled={this.isLoading}
                value={this.api}
                onChange={e => this.changeAPI(e.target.value)}
              >
                <option value="addresses">/addresses</option>
                <option value="blocks_transactions">
                  /blocks_transactions
                </option>
                <option value="implements_abi">/implements_abi</option>
              </select>
            </div>
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
              readOnly={this.isLoading}
              width={"100%"}
              height={"100%"}
              focus={true}
            />
          </Body>
        </Column>
        <Column style={{ backgroundColor: "#E0E4EB" }}>
          {this.isError ? (
            <Header style={{ backgroundColor: "#D84A2F", color: "white" }}>
              <div>Error</div>
            </Header>
          ) : (
            <Header style={{ backgroundColor: "#CAD3DB", color: "#1C73D4" }}>
              <div>
                Results
                <Spacer inline size={0.5} />
                <small>
                  <ResultsFormatLink
                    onClick={() => this.toggleFormattedResults()}
                    selected={this.showFormattedResults}
                  >
                    Formatted
                  </ResultsFormatLink>
                  <Spacer inline size={0.25} />
                  <ResultsFormatLink
                    onClick={() => this.toggleFormattedResults()}
                    selected={!this.showFormattedResults}
                  >
                    Raw
                  </ResultsFormatLink>
                </small>
              </div>
              {this.results && (
                <small>
                  Showing{" "}
                  {this.results.hits.hits.length > 0 ? (
                    <strong>
                      {this.from + 1} -{" "}
                      {this.from + this.results.hits.hits.length}
                    </strong>
                  ) : (
                    <strong>0</strong>
                  )}{" "}
                  of <strong>{this.results.hits.total}</strong>
                  {this.hasPreviousPage && (
                    <span>
                      <Spacer inline size={0.5} />
                      <a
                        style={{ textDecoration: "underline" }}
                        onClick={() => this.goToPreviousPage()}
                      >
                        Previous
                      </a>
                    </span>
                  )}
                  {this.hasNextPage && (
                    <span>
                      <Spacer inline size={0.5} />
                      <a
                        style={{ textDecoration: "underline" }}
                        onClick={() => this.goToNextPage()}
                      >
                        Next
                      </a>
                    </span>
                  )}
                </small>
              )}
            </Header>
          )}
          <Body>
            {this.results &&
              (this.showFormattedResults && !this.isError ? (
                <div style={{ padding: "10px" }}>
                  {this.results.hits.hits.map((result, i) => (
                    <FormattedResult key={i} result={result} />
                  ))}
                  {this.results.hits.total == 0 && (
                    <div style={{ color: "#666" }}>
                      No results{" "}
                      <small>
                        <a
                          style={{ textDecoration: "underline" }}
                          onClick={() => this.toggleFormattedResults()}
                        >
                          View Raw
                        </a>
                      </small>
                    </div>
                  )}
                </div>
              ) : (
                <AceEditor
                  mode="json"
                  theme="xcode"
                  showGutter={false}
                  value={JSON.stringify(this.results, undefined, 2)}
                  readOnly={true}
                  width={"100%"}
                  height={"100%"}
                  style={{ backgroundColor: "transparent" }}
                  editorProps={{ $blockScrolling: true }}
                />
              ))}
          </Body>
        </Column>
      </Flex>
    );
  }
}
