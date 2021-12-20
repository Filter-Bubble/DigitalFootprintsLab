import React, { useState, useEffect } from 'react';
import db from "apis/dexie";

export const useDatabaseEntries = (table, field) => {
  const [loadingData, setLoadingData] = useState(false);
  const [keyTotalObj, setKeyTotalObj] = useState({});

  useEffect(() => {

    const fetchData = async () => {
      setLoadingData(true);

      let t = await db.idb.table(table);
    
      let collection = await t.toCollection();

      const keyTotalObj = {};
    
      await collection.each((entry) => {
        let keys = Array.isArray(entry[field]) ? entry[field] : [entry[field]];
        for (let key of keys) {
          if (key !== "") {
            key = key.split('.').slice(-2).join('.') // poor man's domain extraction
    
            // Domain entry
            if (keyTotalObj[key] === undefined) {
              keyTotalObj[key] = {
                id: entry.id,
                type: 'domain',
                name: key,
                parent: "root",
                count: 1,
                ids: [entry.id],
                category: ["Kennis", "Winkelen", "Nieuws"][Math.floor(Math.random() * 3)]
              };
            }
            else {
              keyTotalObj[key].count++;
              keyTotalObj[key].ids.push(entry.id);
            }
    
            // Url entry
            const url = entry['url'];
            if (url !== key) {
              if (keyTotalObj[url] === undefined) {
                keyTotalObj[url] = {
                  id: entry.id,
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
      });

      setKeyTotalObj(keyTotalObj);
      setLoadingData(false);
    }

    fetchData();

  }, [table, field]);

  return [ loadingData, keyTotalObj ];
};
