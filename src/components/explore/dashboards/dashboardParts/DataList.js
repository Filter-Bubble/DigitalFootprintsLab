import db from "apis/dexie";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Button, Container, Dimmer, Header, Loader, Segment, Table, Visibility
} from "semantic-ui-react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const PAGESIZE = 25;

const propTypes = {
  /** The name of the table in DB */
  table: PropTypes.string,
  /** An object with layout information.
   * The keys should be columns in the table
   * The values are objects with a "type" (header, meta or description) and a react inline style
   * See BrowsingHistory.js or SearchHistory.js for examples
   */
  layout: PropTypes.array,
  /** An array with row IDs to filter on */
  selection: PropTypes.array,
  /** A string to indicate the loading status */
  loading: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

/**
 * Creates a list of items for a given table in the indexedDB
 */
const DataList = ({ table, layout, selection, loading }) => {
  const [data, setData] = useState([]);
  const [n, setN] = useState(1);
  const [selectionN, setSelectionN] = useState(0);

  const [confirm, setConfirm] = useState({ open: false, ask: true, itemIds: [] });
  useEffect(() => {
    if (!table) {
      setData([]);
      return null;
    }
    fetchFromDb(table, PAGESIZE, setN, setSelectionN, setData, selection);
  }, [table, selection, confirm]);

  const onBottomVisible = async () => {
    // infinite scroll
    // <Visibility> checks whether bottom of (invisible) div is visible, and if so adds more data
    const offset = data.length;
    let newdata = null;
    if (selection === null) {
      newdata = await db.getTableBatch(table, offset, PAGESIZE);
    } else {
      newdata = await db.getTableFromIds(table, selection.slice(offset, offset + PAGESIZE));
    }
    setData([...data, ...newdata]);
  };

  const createItem = (item) => {
    return layout.map((field, i) => {
      let content = item[field];
      if (content instanceof Date) content = content.toISOString().slice(0, 19).replace(/T/g, " ");
      return (<Table.Cell key={i+1}>{content}</Table.Cell>)
    });
  };

  const createItems = () => {
    if (data === null || data.length === 0) return null;

    //const image = Object.keys(layout).find((field) => layout[field].type === "image");

    return data.map((item, i) => {
      return (
        <Table.Row key={i}>
          {/* {image ? <Item.Image size="tiny" src={item[image]} /> : null} */}
          <Table.Cell key="0">
            <Button
              onClick={() => setConfirm({ ...confirm, open: true, itemIds: [item.id] })}
              icon="trash alternate" />
          </Table.Cell>
          {createItem(item)}
        </Table.Row>
      );
    });
  };

  return (
    <Container
      style={{
        height: "100%",
        width: "100%",
        padding: "0",
        background: "#00000087",
      }}
    >
      <Segment style={{ background: "white" }}>
        <Header textAlign="center" style={{ color: "black" }}>
          <Dimmer active={loading}>
            <Loader />
          </Dimmer>
          {selectionN === n ? null : (
            <Button
              onClick={() => setConfirm({ ...confirm, open: true, itemIds: selection })}
              icon="trash alternate"
              style={{ color: "#b23434bd", height: "1em", padding: "0", background: "#ffffff00" }}
            />
          )}
          {selectionN === n ? n : `${selectionN} / ${n}`} items
        </Header>
      </Segment>

      <Container style={{ width: "100%", height: "100%", overflowY: "auto" }}>
        <Visibility continuous onBottomVisible={onBottomVisible}>
          <Table striped fixed>
            <Table.Header>
              <Table.Row>
                { ['', ...layout].map((field, i) =>
                  (<Table.HeaderCell key={i} width={[1, 3, 10, 10][i]} style={{top: "0px", position: "sticky", zIndex: "2"}}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Table.HeaderCell>))
                }
              </Table.Row>
            </Table.Header>
            <Table.Body>{createItems()}</Table.Body>
          </Table>
        </Visibility>
      </Container>

      <ConfirmDeleteModal table={table} confirm={confirm} setConfirm={setConfirm} />
    </Container>
  );
};


const fetchFromDb = async (table, pageSize, setN, setSelectionN, setData, selection) => {
  let n = await db.getTableN(table);
  setSelectionN(selection === null ? n : selection.length);
  setN(n);
  let newdata = [];

  if (n > 0) {
    if (selection === null) {
      newdata = await db.getTableBatch(table, 0, pageSize);
    } else {
      newdata = await db.getTableFromIds(table, selection.slice(0, PAGESIZE));
    }
  }

  // prevents delay after removing items while other filters are still resetting
  if (newdata !== null && newdata.length === 0) setSelectionN(0);

  setData(newdata);
};

DataList.propTypes = propTypes;
export default React.memo(DataList);
