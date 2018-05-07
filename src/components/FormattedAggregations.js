import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "react-emotion";
import Spacer from "./Spacer";
import ReactJson from "react-json-view";

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
  background-color: #4656eb;
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
export default class FormattedAggregations extends Component {
  render() {
    return (
      <Result>
        <Header>
          <div>Aggregations</div>
        </Header>
        <Body>
          <ReactJson
            src={this.props.source}
            name={false}
            collapsed={1}
            enableClipboard={false}
          />
        </Body>
      </Result>
    );
  }
}
