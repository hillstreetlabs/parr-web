import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "react-emotion";
import Spacer from "./Spacer";

const GreyText = styled("span")`
  color: #bbb;
  font-size: 12px;
`;

@observer
export default class KeyboardShortcuts extends Component {
  render() {
    return (
      <GreyText>
        Save: ⌘S
        <Spacer inline size={0.6} />
        Format: ⌘P
        <Spacer inline size={0.6} />
        Run: ⌘↵
        <Spacer inline />
      </GreyText>
    );
  }
}
