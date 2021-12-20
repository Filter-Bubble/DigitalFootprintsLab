import React, { useEffect, useState } from "react";
import { PropTypes } from "prop-types";
import db from "apis/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import BubbleChartSpec from './BubbleChartSpec';
import ConfirmModal from "./ConfirmModal";
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
  const [data, setData] = useState({tree: []});
  const [loadingData, setLoadingData] = useState(false);
  const [selectedDatum, setSelectedDatum] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, ask: true, itemIds: [] });
  const [filteredDatum, setFilteredDatum] = useState(null);
  const [zoomlevelUrls, setZoomlevelUrls] = useState(false);

  const n = useLiveQuery(() => db.idb.table(table).count());

  useEffect(() => {
    setOutSelection(filteredDatum === null ? null : filteredDatum.ids);
    setZoomlevelUrls(filteredDatum !== null);
  }, [filteredDatum, setOutSelection]);

  useEffect(() => {
    prepareData(table, field, inSelection, setData, setLoadingData, zoomlevelUrls);
  }, [table, field, inSelection, setData, n, setLoadingData, zoomlevelUrls]);

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

const generateToken = async (key, urls) => {
  var message = ([key].concat(urls)).join("|");
  const msgBuffer = new TextEncoder().encode(message);                    
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const prepareData = async (table, field, selection, setData, setLoadingData, zoomlevelUrls) => {
  setLoadingData(true);

  if (zoomlevelUrls && selection === null) return;

  let keyTotalObj = {};

  let t = await db.idb.table(table);

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);

  let domainObjects = [];

  await collection.each((entry) => {
    let keys = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
    for (let key of keys) {
      if (key !== "") {
        key = key.split('.').slice(-2).join('.')

        // Domain entry
        if (keyTotalObj[key] === undefined) {
          keyTotalObj[key] = {
            type: 'domain',
            name: key,
            parent: "root",
            count: 1,
            ids: [entry.id],
            category: ["Kennis", "Winkelen", "Nieuws"][Math.floor(Math.random() * 3)]
          };
          domainObjects.push(keyTotalObj[key]); // collect domains
        }
        else {
          keyTotalObj[key].count++;
          keyTotalObj[key].ids.push(entry.id);
        }

        // Url entry (only when filtering on a datum / domain)
        if (zoomlevelUrls && selection.includes(entry.id)) {
          const url = entry['url'];
          if (url !== key) {
            if (keyTotalObj[url] === undefined) {
              keyTotalObj[url] = {
                type: 'url',
                name: url,
                title: entry.title,
                parent: key,
                count: 1,
                ids: [entry.id]
              }
            }
            else {
              keyTotalObj[url].count++;
              keyTotalObj[url].ids.push(entry.id);
            }
          }
        }
      }
    }
  });
  domainObjects = domainObjects
    .filter(obj => obj.count > 500 &&
      obj.type === 'domain' &&
      obj.name !== 'localhost' &&
      obj.name !== 'newtab');
  if (domainObjects.length > 0) {
    const domains = domainObjects.map(obj => obj.name);
    const token = await generateToken('1234', domains);
    const url = `https://ifb.sharkwing.com/domaininfo/?${ domains.map(domain => `url=${domain}`).join('&') }&token=${token}`
    console.log(token, url);
  //  https://ifb.sharkwing.com/domaininfo/?url=youtube.com&url=github.com&url=facebook.com&url=office.com&url=google.com&url=feedly.com&url=nu.nl&url=nos.nl&url=flowkey.com&url=springreizen.nl&token=d330929b9e776644ce09a31a0c647581d0b40c8b471768f6a0858076a43de9b1
  //  fetch("https://dd.amcat.nl?url=twitter.com&url=www.mediamarkt.nl&url=marktplaats.nl&token=0ba1a1bee7a0d44a1be0c2d293f9f737c9f912a6b8a593b37e884429b3f9b9d4")
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        for (const [key, value] of Object.entries(data)) {
          keyTotalObj[key].category = value.category;
          keyTotalObj[key].logo = `/logo/${ value.logo.split('/').slice(-1) }`;
        }

        let keyTotal = [{name: "root"}, ...Object.values(keyTotalObj)];
        setData({ tree: keyTotal });
        setLoadingData(false);
      })
      .catch(err => console.log(err));
  }
  else {
    let keyTotal = [{type: 'root', name: 'root'}, ...Object.values(keyTotalObj)];
    setData({ tree: keyTotal });
    setLoadingData(false);
  }

};

BubbleChart.propTypes = propTypes;
export default React.memo(BubbleChart);
