import React, { useEffect, useState, useRef } from "react";
import { PropTypes } from "prop-types";
import { useD3 } from '../../../../hooks/useD3.js';
import * as d3 from 'd3';
import uid from "util/uid";
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
  const bubbleChartDiv = useRef(null);
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
    .padding(2)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))

  const format = d3.format(",d");

  const ref = useD3(
    (svg) => {
      if (data == null) return;
      const root = pack(data);
      let focus = root;
      let view;

      const tooltip = d3.select(bubbleChartDiv.current)
        .append("div")
        .style("opacity", 1.0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("position", "fixed");

      svg
        .attr("viewBox", [0, 0, width, height])
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .on("click", event => zoom(event, root));

      const node = svg.select(".plot-area").selectAll("g")
        .data(root.descendants())
        .join("g")
          .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

      const color = d3.scaleOrdinal(d3.schemeSet3);

      node.append("circle")
          .attr("id", d => (d.leafUid = uid("leaf")).id)
          .attr("r", d => d.r)
          .attr("fill-opacity", 1.0)
          .attr("fill", (d, i) => color(i))
          .on("mouseover", (event, d) => {
            tooltip.transition()
              .duration(200)
              .style("opacity", 1.0);
            tooltip.html(`${d.data.name}\n${format(d.value)}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 30) + "px");
          })
          .on("mouseout", d => {
            tooltip.transition()
              .duration(500)
              .style("opacity", 1.0);
          })
          .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

      node.append("clipPath")
          .attr("id", d => (d.clipUid = uid("clip")).id)
        .append("use")
          .attr("xlink:href", d => d.leafUid.href);

      // node.append("image")
      //   .attr("x", -8)
      //   .attr("y", -8)
      //   .attr("width", 16)
      //   .attr("heigh", 16)
      //   .attr("href", d => d.data.value > 100 ? `https://${d.data.name}/favicon.ico` : "");

      node.append("text")
          .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d)
        .join("tspan")
          .attr("x", 0)
          .attr("y", (d, i, nodes) => `${i - nodes.length / 2 +  0.8}em`)
          .text(d => d.data.value > 50 ? d.data.name : '');

      const zoomTo = (v) => {
        const k = width / v[2];
        view = v;
        // label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
      }

      const zoom = (event, d) => {
        const focus0 = focus;
    
        focus = d;
        console.log(focus, view);

        const transition = svg.transition()
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", d => {
              const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
              return t => zoomTo(i(t));
            });
    
        // label
        //   .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        //   .transition(transition)
        //     .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        //     .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        //     .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
      }

      zoomTo([root.x, root.y, root.r * 2]);

    },
    [data]
  );

  return (
    <div ref={bubbleChartDiv}>
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
    </div>
  );
}

const prepareData = async (table, field, selection, setData, setLoadingData, setKeys) => {
  setLoadingData(true);

  let keyTotalObj = {};

  let t = await db.idb.table(table);

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);


  await collection.each((entry) => {
    //console.log(url);
    let keys = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
    for (let key of keys) {
      if (key !== "") {
        const url = entry['url'];
        if (keyTotalObj[key] !== undefined) {
          keyTotalObj[key][url] = (keyTotalObj[key][url] || 0) + 1;
        }
        else {
          keyTotalObj[key] = { [url]: 1 };
        }
      }
    }
  });

  let keyTotal = Object.keys(keyTotalObj).map((domainKey) => {
    let domainCount = 0;
    const children = Object.keys(keyTotalObj[domainKey]).map((urlKey) => {
      const urlCount = keyTotalObj[domainKey][urlKey]
      domainCount += urlCount;
      return { name: urlKey, value: urlCount };
    });
    return { 
      name: domainKey,
      value: domainCount,
      children: children
    };
  });

  setData({ children: keyTotal });
  setLoadingData(false);

  setKeys((keys) => new Set([...keys].filter((key) => keyTotalObj[key] != null)));
};

BubbleChart.propTypes = propTypes;
export default React.memo(BubbleChart);
