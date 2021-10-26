import db from "apis/dexie";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Container, Header, Item } from "semantic-ui-react";
import "./Statistics.css";

const PAGESIZE = 25;

const propTypes = {
  /** The name of the table in DB */
  table: PropTypes.string,
  /** An object with layout information.
   * The keys should be columns in the table
   * The values are objects with a "type" (header, meta or description) and a react inline style
   * See BrowsingHistory.js or SearchHistory.js for examples
   */
  layout: PropTypes.object,
  /** An array with row IDs to filter on */
  selection: PropTypes.array,
  /** A string to indicate the loading status */
  loading: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

/**
 * Creates a list of statistics based on the selected table
 */
const Statistics = ({selection, loading }) => {
  const [data, setData] = useState([]);
  const [n, setN] = useState(1);
  const [selectionN, setSelectionN] = useState(0);

  useEffect(() => {
    fetchFromDb(setN, setSelectionN, setData, selection);
  }, [selection, setData]);


  return (
    <Container
      style={{
        height: "98%",
        padding: "0",
        background: "#00000087",
      }}
    >
      <Header as="h1" align={"center"} style={{ color: "white", padding: "0", margin: "0" }}>
        Statistics
      </Header>
      <Item.Group>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Website Visits</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.total_visits}</Item.Description>
          </Item.Content>
        </Item>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Most Visited Domain</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.max_domain}</Item.Description>
            <Item.Extra style={{ color: "white"}}>{data.max}</Item.Extra>
          </Item.Content>
        </Item>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Average visits per Domain</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.mean}</Item.Description>
          </Item.Content>
        </Item>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Number of Unique Domains</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.num_domains}</Item.Description>
          </Item.Content>
        </Item>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Google Searches</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.search}</Item.Description>
          </Item.Content>
        </Item>
        <Item>
          <Item.Content>
            <Item.Header style={{ color: "white"}}>Youtube Videos</Item.Header>
            <Item.Description style={{ color: "white"}}>{data.youtube}</Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    </Container>
  );
};

const fetchFromDb = async (setN, setSelectionN, setData, selection) => {
  let n = await db.getTableN("browsinghistory");
  console.log(selection);
  setSelectionN(selection === null ? n : selection.length);
  setN(n);
  let newdata = [];

  newdata = await db.getTableStatistics(selection);

  // prevents delay after removing items while other filters are still resetting
  if (newdata !== null && newdata.length === 0) setSelectionN(0);

  setData(newdata);
};

Statistics.propTypes = propTypes;
export default React.memo(Statistics);