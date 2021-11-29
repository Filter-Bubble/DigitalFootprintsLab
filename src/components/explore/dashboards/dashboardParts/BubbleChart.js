import React, { useEffect, useState, useRef } from "react";
import { PropTypes } from "prop-types";
import db from "apis/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import BarChart from './BubbleChartSpec';

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
  const bubbleChartDiv = useRef(null);
  const [keys, setKeys] = useState(new Set([]));
  const [words, setWords] = useState([]);
  const [data, setData] = useState({tree: []});
  const [loadingData, setLoadingData] = useState(false);

  const n = useLiveQuery(() => db.idb.table(table).count());

  useEffect(() => {
    prepareData(table, field, inSelection, setData, setLoadingData, setKeys);
  }, [table, field, inSelection, setData, n, setLoadingData, setKeys]);

  function handleHover(...args){
    console.log(args);
  }
  
  const signalListeners = { hover: handleHover };

  return (
    <BarChart data={data} signalListeners={signalListeners} />
  );
}

const prepareData = async (table, field, selection, setData, setLoadingData, setKeys) => {
  setLoadingData(true);

  let keyTotalObj = {};

  let t = await db.idb.table(table);

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);


  await collection.each((entry) => {
    let keys = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
    for (let key of keys) {
      if (key !== "") {

        // Domain entry
        if (keyTotalObj[key] === undefined) {
          keyTotalObj[key] = { name: key, parent: "root", count: 1 };
        }
        else {
          keyTotalObj[key].count++;
        }

        // Url entry
        const url = entry['url'];
        if (url !== key) {
          if (keyTotalObj[url] === undefined) {
            keyTotalObj[url] = { name: url, parent: key, count: 1 }
          }
          else {
            keyTotalObj[url].count++;
          }
        }
      }
    }
  });

  let keyTotal = [{name: "root"}, ...Object.values(keyTotalObj)];
  setData({ tree: keyTotal });
  setLoadingData(false);

  setKeys((keys) => new Set([...keys].filter((key) => keyTotalObj[key] != null)));
};

BubbleChart.propTypes = propTypes;
export default React.memo(BubbleChart);
