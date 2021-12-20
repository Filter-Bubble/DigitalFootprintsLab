import React, { useEffect, useState } from "react";
import { PropTypes } from "prop-types";
import db from "apis/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import BubbleChartSpec from './BubbleChartSpec';
import ConfirmModal from "./ConfirmModal";
import { useDomainInfo } from "./DomainInfo";
import {useDatabaseEntries } from "./DatabaseEntries";
import { Card, Button, Image, Dimmer, Loader } from "semantic-ui-react";

const propTypes = {
  /** The name of the table in db */
  table: PropTypes.string,
  /** The name of the field in db */
  field: PropTypes.string,
  /** An array with a selection of row ids in table */
  inSelection: PropTypes.array,
  /** An integer specifying the number of words in the cloud*/
  nWords: PropTypes.number,
  /** A boolean for whether data is loading */
  loading: PropTypes.bool,
  /** A callback for setting the selection state */
  setOutSelection: PropTypes.func,
};

/**
 * Makes a wordcloud for keys, for a given table:field in db
 */
const BubbleChart = ({ table, field, inSelection, nWords, loading, setOutSelection }) => {
  const [data, setData] = useState({tree: []}); // input for vega visualization
  const [loadingData, setLoadingData] = useState(false);
  const [selectedDatum, setSelectedDatum] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, ask: true, itemIds: [] });
  const [filteredDatum, setFilteredDatum] = useState(null);
  const [zoomlevelUrls, setZoomlevelUrls] = useState(false);
  const [domainInfoStats, domainInfo] = useDomainInfo([]);
  const [databaseLoading, keyTotalObj] = useDatabaseEntries(table, field);
  const n = useLiveQuery(() => db.idb.table(table).count());

  useEffect(() => {
    setOutSelection(filteredDatum === null ? null : filteredDatum.ids);
    setZoomlevelUrls(filteredDatum !== null);
  }, [filteredDatum, setOutSelection]);

  useEffect(() => {
    let nodes = Object.values(keyTotalObj);
    console.log(nodes.length);
    if (inSelection !== null) {
      nodes = nodes.filter(obj => inSelection.includes(obj.id));
    }
    console.log(nodes.length);
    if (!zoomlevelUrls) {
      nodes = nodes.filter(obj => obj.type !== 'url');
    }
    console.log(nodes.length);
    let keyTotal = [
      {type: 'root', name: 'root'}, 
      ...nodes
    ];
    setData({ tree: keyTotal });
  }, [keyTotalObj, inSelection, zoomlevelUrls]);

  // Vega signal handler
  const onSelectedDatum = (signal, datum) => {
    if (datum === null) {
      setFilteredDatum(null);
    }

    setSelectedDatum(datum);
  }

  // Vega signal handler
  const onFilterDatum = (signal, datum) => {
    setFilteredDatum(datum);
    setSelectedDatum(null);
  }

  // Popup button handler
  const filterSelectedDatum = () => {
    setFilteredDatum(selectedDatum);
    setSelectedDatum(null);
  };

  // Popup button handler
  const deleteSelectedDatum = () => {
    setConfirm({ ...confirm, open: true, itemIds: selectedDatum.ids });
    setSelectedDatum(null);
  };

  const signalListeners = {
    selectedDatum: onSelectedDatum,
    filterDatum: onFilterDatum
  };

  const popupStyle = {
    zIndex: 1,
    position: "absolute",
    left: selectedDatum ? selectedDatum.x : 0,
    top: selectedDatum ? selectedDatum.y : 0
  };

  return (
    <div style={{position: "relative"}}>
      <Dimmer active={loading || loadingData}>
        <Loader />
      </Dimmer>
      <BubbleChartSpec data={data} signalListeners={signalListeners} actions={false} />
      { selectedDatum && <div style={popupStyle}>
        <Card>
          <Card.Content>
            { selectedDatum.logo && <Image
              floated='left'
              size='mini'
              src={selectedDatum.logo}
            /> }
            <Button
              basic
              floated='right'
              size='mini'
              icon='close'
              onClick={() => setSelectedDatum(null)}
            />
            <Card.Header>{selectedDatum.name}</Card.Header>
            <Card.Meta>{`${selectedDatum.count} visits`}</Card.Meta>
            <Card.Description>
              <p>{ selectedDatum.title && selectedDatum.title }</p>
              <p>Category: {selectedDatum.category ? selectedDatum.category : 'unknown'}</p>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <div className='ui two buttons'>
              <Button basic color='blue' onClick={filterSelectedDatum}>
                Select
              </Button>
              <Button basic color='red' onClick={deleteSelectedDatum}>
                Delete
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>}
      <ConfirmModal table={table} confirm={confirm} setConfirm={setConfirm} />
    </div>
  );
}

// const prepareData = async (table, field, selection, setData, setLoadingData, zoomlevelUrls) => {
//   domainObjects = domainObjects
//     .filter(obj => obj.count > 500 &&
//       obj.type === 'domain' &&
//       obj.name !== 'localhost' &&
//       obj.name !== 'newtab');
//   if (domainObjects.length > 0) {
//     const domains = domainObjects.map(obj => obj.name);
// };

BubbleChart.propTypes = propTypes;
export default React.memo(BubbleChart);
