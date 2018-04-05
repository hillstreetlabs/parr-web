import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import fetch from "isomorphic-fetch";

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
    const response = await fetch(`${process.env.PARR_URL}/search`, {
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
      <div>
        <h1>Parr</h1>
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
        {this.results && (
          <div>
            <p>Results:</p>
            <pre>{JSON.stringify(this.results, undefined, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}
