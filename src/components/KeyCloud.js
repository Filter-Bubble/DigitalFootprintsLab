import React, { useEffect, useState } from "react";
import ReactWordcloud from "react-wordcloud";

import db from "../apis/dexie";
import { Dimmer, Dropdown, Grid, Header, Loader } from "semantic-ui-react";

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
const wordcloudSize = [1000, 400];

const KeyCloud = ({ table, field, selection, nWords, loading, setSelection }) => {
  // makes a wordcloud for keys in a table:field in db
  // selection is an array of primary key ids in table:field
  // nWords is an integer, loading is a bool, setSelection is a setState callback for an array of table ids
  const [keys, setKeys] = useState(new Set([]));
  const [words, setWords] = useState([]);
  const [data, setData] = useState(null);

  useEffect(() => {
    prepareData(table, field, selection, setData);
  }, [table, field, selection, setData]);

  useEffect(() => {
    if (!data) {
      setWords([]);
      return null;
    }
    const words = data.keys.slice(0, nWords).map((word) => {
      const text = word.text.replace("www.", "");
      return { text: text, domain: word.text, value: word.value };
    });
    setWords(words);
  }, [data, nWords]);

  useEffect(() => {
    let ignore = false; // use closure to 'cancel' promise. prevents slow old requests from overwriting new

    const getSelection = async () => {
      let selection = keys.size > 0 ? await db.getSelectionAny(table, field, [...keys]) : null;
      if (!ignore) setSelection(selection);
    };

    getSelection();
    return () => {
      ignore = true;
    };
  }, [keys, setSelection, table, field]);

  const callbacks = React.useCallback(() => {
    return {
      onWordClick: (word) => {
        setKeys((old) => {
          const newkeys = new Set([...old]);
          if (newkeys.has(word.domain)) {
            newkeys.delete(word.domain);
          } else {
            newkeys.add(word.domain);
          }
          return newkeys;
        });
      },
      getWordColor: (word) => {
        if (keys.size === 0) return "white";
        return keys.has(word.domain) ? "white" : "grey";
      },
    };
  }, [keys]);

  return (
    <Grid
      style={{
        width: "100%",
        background: "#ffffff00",
        border: "none",
        boxShadow: "none",
        paddingTop: "2em",
      }}
    >
      <Grid.Column width={12} style={{ height: "100%", padding: "0", margin: "0" }}>
        <Dimmer active={loading}>
          <Loader />
        </Dimmer>
        <Header as="h1" align={"center"} style={{ color: "white", padding: "0", margin: "0" }}>
          Top {nWords} {field}s
        </Header>
        <ReactWordcloud
          words={words}
          minSize={wordcloudSize}
          callbacks={callbacks()}
          options={wordcloudOptions}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <Header style={{ color: "white" }}>{field.toUpperCase()} FILTER</Header>
        <p style={{ fontStyle: "italic", color: "white" }}>
          Filter on {field} by adding them below or clicking on the wordcloud
        </p>
        <Dropdown
          fluid
          multiple
          selection
          clearable
          search
          style={{
            width: "100%",
            color: "white",
            minHeight: "20em",
            background: "#ffffff21",
          }}
          value={[...keys]}
          onChange={(e, d) => setKeys(new Set(d.value))}
          options={
            data
              ? data.uniqueKeys.map((e) => ({
                  value: e,
                  text: e.replace("www.", ""),
                  key: e,
                }))
              : []
          }
        />
      </Grid.Column>
    </Grid>
  );
};

const prepareData = async (table, field, selection, setData) => {
  let keyTotalObj = {};

  let t = await db.idb.table(table);

  let uniqueKeys = await t.orderBy(field).uniqueKeys();

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);

  await collection.each((url) => {
    if (url[field] !== "") {
      keyTotalObj[url[field]] = (keyTotalObj[url[field]] || 0) + 1;
    }
  });
  let keyTotal = Object.keys(keyTotalObj).map((key) => {
    return { text: key, value: keyTotalObj[key] };
  });
  keyTotal.sort((a, b) => b.value - a.value); // sort from high to low value
  setData({ keys: keyTotal, uniqueKeys: uniqueKeys });
};

export default React.memo(KeyCloud);