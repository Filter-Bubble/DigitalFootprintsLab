import React, { useEffect, useState } from "react";
import { PropTypes } from "prop-types";
import { useD3 } from '../../../../hooks/useD3.js';
import * as d3 from 'd3';

import db from "apis/dexie";
import { Dimmer, Dropdown, Grid, Header, Loader } from "semantic-ui-react";
import { useLiveQuery } from "dexie-react-hooks";

const wordcloudOptions = {
  rotations: 0,
  enableOptimizations: true,
  enableTooltip: false,
  deterministic: true,
  fontFamily: "impact",
  fontSizes: [20, 60],
  transitionDuration: 500,
  colors: ["white"],
};
const wordcloudSize = undefined;

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

  const [keys, setKeys] = useState(new Set([]));
  const [words, setWords] = useState([]);
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const n = useLiveQuery(() => db.idb.table(table).count());

  useEffect(() => {
    prepareData(table, field, inSelection, setData, setLoadingData, setKeys);
  }, [table, field, inSelection, setData, n, setLoadingData, setKeys]);

  const height = 500;
  const width = 500;

  const pack = data => d3.pack()
    .size([width - 2, height - 2])
    .padding(1)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))

  const format = d3.format(",d");

  let count = 1;
   
  const ref = useD3(
    (svg) => {
      console.log(data);
      if (data == null) return;

      const root = pack(data);

      svg
        .attr("viewBox", [0, 0, width, height])
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

      const leaf = svg.select(".plot-area").selectAll("g")
        .data(root.leaves())
        .join("g")
          .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

      leaf.append("circle")
          .attr("id", d => (d.leafUid = "id-" + ++count))
          .attr("r", d => d.r)
          .attr("fill-opacity", 1.0)
          .attr("fill", d => d3.interpolateWarm(d.data.value/3000));//color(d.data.group));

      leaf.append("clipPath")
          .attr("id", d => (d.clipUid = "id-" + ++count))
        .append("use")
          .attr("xlink:href", d => d.leafUid.href);

      leaf.append("text")
          .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d)
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i, nodes) => `${i - nodes.length / 2 +  0.8}em`)
          .text(d => d.data.value > 50 ? d.data.name : '');

      leaf.append("title")
          .text(d => d.data.value > 50 ? `${d.data.title}\n${format(d.value)}` : '');
      
    },
    [data]
  );

  return (
    <svg
      ref={ref}
      style={{
        height: 500,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    >
      <g className="plot-area" />
    </svg>
  );
}

const prepareData = async (table, field, selection, setData, setLoadingData, setKeys) => {
  setLoadingData(true);

  let keyTotalObj = {};

  let t = await db.idb.table(table);

  let uniqueKeys = await t.orderBy(field).uniqueKeys();

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);

  await collection.each((url) => {
    let keys = Array.isArray(url[field]) ? url[field] : [url[field]];
    for (let key of keys) {
      if (key !== "") {
        keyTotalObj[key] = (keyTotalObj[key] || 0) + 1;
      }
    }
  });
  let keyTotal = Object.keys(keyTotalObj).map((key) => {
    return { name: key, value: keyTotalObj[key] };
  });
  keyTotal.sort((a, b) => b.value - a.value); // sort from high to low value

//  console.log(keyTotal, uniqueKeys);
  
  setData({ children: keyTotal });
  setLoadingData(false);

  setKeys((keys) => new Set([...keys].filter((key) => keyTotalObj[key] != null)));
};

BubbleChart.propTypes = propTypes;
export default React.memo(BubbleChart);
