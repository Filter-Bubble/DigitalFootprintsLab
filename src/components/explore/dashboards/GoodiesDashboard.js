import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Button, Grid, Icon, Segment, Header } from "semantic-ui-react";
import intersect from "util/intersect";
import ColoredBackgroundGrid from "./dashboardParts/ColoredBackgroundGrid";
import TimeLine from "./dashboardParts/TimeLine";
import FunFacts from "./fun/FunFacts";

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
const GoodiesDashboard = ({ searchOn, layout, table, cloudKey }) => {
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

  return (
    <ColoredBackgroundGrid color={"#000000b0"}>
      <Segment>
        <Button
          style={{ background: "#ffffff", margin: "0"}}
          onClick={() => history.push(`${process.env.PUBLIC_URL}/datasquare`)}>
          <Icon name="backward" />
          Go back
        </Button>
      </Segment>
      <Grid divided={"vertically"} style={gridStyle}>
        <Grid.Row centered columns={1}>
          <Grid.Column width={16} style={{ margin: "0", textAlign: "center" }}>
            <Header as="h1" align={"center"} style={{ color: "white", padding: "0" }}>
              Thank you!!
            </Header>
            <iframe src="https://giphy.com/embed/3o7TKQ7ql1zNlTarXa" width="480" height="270" frameBorder="0" class="giphy-embed" allowFullScreen title="giphy"></iframe>
            <p><a href="https://giphy.com/gifs/Originals-internet-3o7TKQ7ql1zNlTarXa">via GIPHY</a></p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row centered columns={1}>
          <Grid.Column width={16} style={{ margin: "0" }}>
            <FunFacts
              selection={selection}
              loading={loading}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row style={{ margin: "0" }}>
          <TimeLine
            table={table}
            field={"date"}
            inSelection={timeInSelection}
            loading={loading}
            setOutSelection={setTimeOutSelection}
        />
        </Grid.Row>
      </Grid>
    </ColoredBackgroundGrid>
  );
};

GoodiesDashboard.propTypes = propTypes;
export default GoodiesDashboard;
