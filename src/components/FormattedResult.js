import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "react-emotion";
import Spacer from "./Spacer";
import ReactJson from "react-json-view";

const ETHERSCAN_TYPE_MAP = {
  transaction: "tx",
  block: "block",
  address: "address"
};

const Result = styled("div")`
  width: 100%;
  background-color: #fafafa;
  box-shadow: 1px 0px 3px rgba(36, 37, 38, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const Header = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px 10px;
  background-color: #1fccb2;
  color: white;

  & a {
    color: white;
  }
`;

const Body = styled("div")`
  overflow-x: scroll;
  padding: 10px;
`;

@observer
export default class FormattedResult extends Component {
  get etherscanLink() {
    const [type, id] = this.props.result._source.id.split(":", 2);
    return `https://etherscan.io/${ETHERSCAN_TYPE_MAP[type]}/${id}`;
  }

  render() {
    const [type, id] = this.props.result._source.id.split(":", 2);
    return (
      <Result>
        <Header>
          <div>{type}</div>
          <a href={this.etherscanLink} target="_blank">
            <small>View on Etherscan</small>
          </a>
        </Header>
        <Body>
          <ReactJson
            src={this.props.result}
            name={false}
            collapsed={1}
            enableClipboard={false}
          />
        </Body>
      </Result>
    );
  }
}
