import React from "react";
import { observable, action, computed } from "mobx";
import { observer } from "mobx-react";
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  VerticalBarSeries,
  DiscreteColorLegend,
  Crosshair
} from "react-vis";

@observer
export default class Status extends React.Component {
  @observable blockStatus;
  @observable crosshairValues = [];

  constructor(props) {
    super(props);
    this.getStatusResults();
    setInterval(this.getStatusResults, 5000);

    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onNearestX = this._onNearestX.bind(this);
  }

  async getStatusResults() {
    const response = await fetch(
      `${process.env.PARR_URL}/stats/monitoring`
    ).then(res => res.json());
    this.blockStatus = Array.from(response.response.hits.hits).reduce(
      (statusData, result) => {
        statusData[0].push({
          x: result._source.hash,
          y: result._source.indexed_count
        });
        statusData[1].push({
          x: result._source.hash,
          y: result._source.transaction_count - result._source.indexed_count
        });
        return statusData;
      },
      [[], []]
    );
  }

  _onNearestX(value, { index }) {
    this.crosshairValues = this.blockStatus.map(d => d[index]);
  }

  _onMouseLeave() {
    this.crosshairValues = [];
  }

  _crosshairItemFormat(dataPoints) {
    return [
      { title: "Indexed", value: dataPoints[0].y },
      { title: "Unindexed", value: dataPoints[1].y }
    ];
  }

  _crosshairTitleFormat(dataPoints) {
    // console.log({ _crosshairTitleFormat: dataPoints });
    return {
      title: "Block",
      value: dataPoints[0].x
    };
  }

  render() {
    if (!this.blockStatus) {
      return null;
    }
    return (
      <div>
        <link
          rel="stylesheet"
          href="https://unpkg.com/react-vis/dist/style.css"
        />
        <h1 style={{ marginLeft: 20 }}>Index Status for Last 100 Blocks</h1>
        <DiscreteColorLegend
          style={{ position: "absolute", left: "40px", top: "0px" }}
          items={[
            {
              title: "Unindexed transactions",
              color: "#79C7E3"
            },
            {
              title: "Indexed transactions",
              color: "#12939A"
            }
          ]}
        />
        <XYPlot
          xType="ordinal"
          stackBy="y"
          width={1200}
          height={600}
          xDistance={100}
        >
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis hideTicks />
          <YAxis />
          <VerticalBarSeries
            className="vertical-bar-series"
            data={Array.from(this.blockStatus[0])}
          />
          <VerticalBarSeries
            onNearestX={this._onNearestX}
            className="vertical-bar-series"
            data={Array.from(this.blockStatus[1])}
          />
          <Crosshair
            values={Array.from(this.crosshairValues)}
            titleFormat={this._crosshairTitleFormat}
            itemsFormat={this._crosshairItemFormat}
          />
        </XYPlot>
      </div>
    );
  }
}
