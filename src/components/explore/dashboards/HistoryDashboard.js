import PropTypes from "prop-types";
import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Button, Grid, Icon, Segment } from "semantic-ui-react";
import intersect from "util/intersect";
import ColoredBackgroundGrid from "./dashboardParts/ColoredBackgroundGrid";
import DataList from "./dashboardParts/DataList";
import QueryInput from "./dashboardParts/QueryInput";
import Statistics from "./dashboardParts/Statistics";
//import KeyCloud from "./dashboardParts/KeyCloud";
import BubbleChart from "./dashboardParts/BubbleChart";

const gridStyle = { paddingTop: "0em", marginTop: "0em", height: "90vh" };

const propTypes = {
  /** an Array indicating which fields in table should be used in the fulltext search */
  searchOn: PropTypes.array.isRequired,
  /** an object that conveys which fields in the table are shown in the DataList */
  layout: PropTypes.array.isRequired,
  /** the name of the table in the indexedDB */
  table: PropTypes.string.isRequired,
  /** the field in the table that is used in the wordcloud. Can also be a multientry index (e.g., an indexed array of words in indexedDB) */
  cloudKey: PropTypes.string.isRequired,
};

/**
 * Renders a dashboard page with components for browsing and visualizing history data
 */
const HistoryDashboard = ({ searchOn, layout, table, cloudKey }) => {
  const history = useHistory();

  const [loading, setLoading] = useState(false);

  // The selection states are arrays of row ids
  // the intersection of these arrays is used to combine selections
  // this is ok-ish fast, since the id indices are ordered; see intersect function
  // but i'm sure there are better solutions
  const [selection, setSelection] = useState(null);
  const [querySelection, setQuerySelection] = useState(null);

  // for the key and time selections we need both in and out selections
  // the in selection is the combined selection of other filters
  // the out selection is the selection based on the filter itself
  // (this way the out selection does not need to be updated if the in selection changes,
  //  and visualizations like word clouds also need to show the non-selected items)
  const [keyInSelection, setKeyInSelection] = useState(null);
  const [keyOutSelection, setKeyOutSelection] = useState(null);
  const [timeInSelection, setTimeInSelection] = useState(null);
  const [timeOutSelection, setTimeOutSelection] = useState(null);

  useEffect(() => {
    console.log(keyOutSelection);
    console.log(timeOutSelection);
    console.log(intersect([querySelection, keyOutSelection, timeOutSelection]));
    setSelection(intersect([querySelection, keyOutSelection, timeOutSelection]));
  }, [querySelection, keyOutSelection, timeOutSelection]);

  useEffect(() => {
    setKeyInSelection(intersect([querySelection, timeOutSelection]));
  }, [querySelection, timeOutSelection]);

  useEffect(() => {
    setTimeInSelection(intersect([querySelection, keyOutSelection]));
  }, [querySelection, keyOutSelection]);

  const donateData = () => {
    //TODO: submit filtered data
    history.push("/goodies");
  }

  return (
    <Fragment>
    <ColoredBackgroundGrid color={"#000000b0"}>
      <Segment>
        <Button
          style={{ background: "#ffffff", margin: "0", float: "left" }}
          onClick={() => history.push("/datasquare")}>
          <Icon name="backward" />
          Go back
        </Button>
        <div style={{display: "table", margin: "0 auto"}}>
          <QueryInput
              table={table}
              searchOn={searchOn}
              setSelection={setQuerySelection}
              setLoading={setLoading} />
        </div>
      </Segment>
      <Grid divided={"vertically"} style={gridStyle}>
          <Grid.Row centered columns={2}>
            <Grid.Column width={10} style={{ padding: "1em", paddingLeft: "2em", paddingRight: "0"}}>
              <BubbleChart
                table={table}
                field={cloudKey}
                inSelection={keyInSelection}
                nWords={50}
                loading={loading}
                setOutSelection={setKeyOutSelection}
              />
            </Grid.Column>
            <Grid.Column width={4} style={{ padding: "1em", paddingLeft: "0" }}>
              <Statistics table={table} layout={layout} selection={selection} loading={loading} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row centered style={{ padding: "0"}}>
            <Grid.Column width={14} style={{ height: "40vh"}}>
              <DataList table={table} layout={layout} selection={selection} loading={loading} />
            </Grid.Column>
          </Grid.Row>
      </Grid>
    </ColoredBackgroundGrid>
    <Segment style={{background: "white", textAlign: "center", position: "absolute", bottom: "0px", width: "100%", zIndex: 4}}>
            <Button size="huge"
              style={{color: "deeppink", background: "gold", width: "80%", boxShadow: "5px 5px 2px grey"}}
              onClick={() => donateData()}>Donate Your Data & Discover 10 facts about your online-self!</Button>
          </Segment>
    </Fragment>
);
};

HistoryDashboard.propTypes = propTypes;
export default HistoryDashboard;
