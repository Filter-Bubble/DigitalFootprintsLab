import { ResponsiveCalendar } from "@nivo/calendar";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Dimmer, Grid, Loader } from "semantic-ui-react";
import db from "apis/dexie";
import createColors from "util/createColors";

const COLORS = createColors(100, "white", "#c28c95", "#954856");
const ZEROCOLOR = ["white"];
const LEGENDS = [
  {
    anchor: "bottom-right",
    direction: "row",
    translateY: 36,
    itemCount: 4,
    itemWidth: 42,
    itemHeight: 36,
    itemsSpacing: 14,
    itemDirection: "right-to-left",
  },
];
const MARGIN = { top: 0, right: 0, bottom: 0, left: 40 };
const THEME = { textColor: "white", fontSize: 14 };

const TimeLine = ({ table, field, inSelection, loading, setOutSelection }) => {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(null);
  const [dayRange, setDayRange] = useState([null, null]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectionStatus, setSelectionStatus] = useState("idle");

  const n = useLiveQuery(() => db.idb.table(table).count());

  useEffect(() => {
    prepareData(table, field, inSelection, setData, setLoadingData);
  }, [table, field, inSelection, setData, setLoadingData, n]);

  useEffect(() => {
    if (data === null) {
      setDays(null);
      return;
    }
    setDays(
      data.day.data.filter((day) => {
        if (dayRange[0] !== null && day.date < dayRange[0]) return false;
        if (dayRange[1] !== null && day.date > dayRange[1]) return false;
        return true;
      })
    );
  }, [data, dayRange, setDays]);

  useEffect(() => {
    let ignore = false;
    const getSelection = async () => {
      let selection = null;
      if (dayRange[0] !== null || dayRange[1] !== null) {
        selection = await db.getSelectionRange(table, field, dayRange[0], dayRange[1]);
      }
      if (!ignore) setOutSelection(selection);
    };
    getSelection();

    return () => {
      ignore = true; // use closure to 'cancel' promise. prevents delayed older requests from overwriting new
    };
  }, [dayRange, table, field, setOutSelection]);

  if (data === null || days === null) return null;

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
      <Grid.Row centered style={{ padding: "0" }}>
        <ButtonGroup>
          <Button
            primary
            style={{ width: "20em" }}
            onClick={() => setSelectionStatus("select_start")}
          >
            {selectionStatus === "select_start"
              ? "Click on calender to set start date"
              : dayRange[0]
              ? `From date: ${formatDate(dayRange[0])}`
              : `Click here to set start date`}
          </Button>
          <Button
            secondary
            style={{ width: "20em" }}
            onClick={() => setSelectionStatus("select_end")}
          >
            {selectionStatus === "select_end"
              ? "Click on calender to set end date"
              : dayRange[1]
              ? `To date: ${formatDate(dayRange[1])}`
              : `Click here to set end date`}
          </Button>
          <Button
            disabled={dayRange[0] === null && dayRange[1] === null}
            onClick={() => setDayRange([null, null])}
          >
            reset
          </Button>
        </ButtonGroup>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column
          width={16}
          style={{ height: "30em", width: "100%", padding: "0", margin: "0" }}
        >
          <Dimmer active={loading || loadingData}>
            <Loader />
          </Dimmer>
          <ResponsiveCalendar
            data={days}
            from={data.day.min}
            to={data.day.max}
            emptyColor="#ededed1f"
            colors={days.some((day) => day.value > 0) ? COLORS : ZEROCOLOR}
            margin={MARGIN}
            yearSpacing={35}
            monthSpacing={2}
            monthBorderColor="#ffffff"
            dayBorderWidth={2}
            dayBorderColor="#150a0a2e"
            legends={LEGENDS}
            onContextMenu={(e) => console.log(e)}
            onClick={(e) => {
              if (selectionStatus === "select_start") {
                let midnightMorning = new Date(e.day);
                if (dayRange[1] !== null && dayRange[1] < midnightMorning)
                  midnightMorning = new Date(dayRange[1]);
                midnightMorning.setHours(0, 0, 0, 0);
                setDayRange([midnightMorning, dayRange[1]]);
                setSelectionStatus("idle");
              }
              if (selectionStatus === "select_end") {
                console.log(e);
                let midnightEvening = new Date(e.day);
                if (dayRange[0] !== null && dayRange[0] >= midnightEvening)
                  midnightEvening = new Date(dayRange[0]);
                midnightEvening.setHours(23, 59, 59, 0);
                setDayRange([dayRange[0], midnightEvening]);
                setSelectionStatus("idle");
              }
            }}
            theme={THEME}
          />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

const prepareData = async (table, field, selection, setData, setLoadingData) => {
  setLoadingData(true);

  let dayTotalObj = {};
  let weekday = [0, 0, 0, 0, 0, 0, 0];

  let t = await db.idb.table(table);

  let collection =
    selection === null ? await t.toCollection() : await t.where("id").anyOf(selection);

  let dateOrdered = t.orderBy(field);
  let minDate = await dateOrdered.first();
  let maxDate = await dateOrdered.last();
  minDate = minDate.date;
  maxDate = maxDate.date;

  await collection.each((url) => {
    if (url[field] !== "") {
      weekday[url[field].getDay()]++;
      const day = formatDate(url[field]);
      dayTotalObj[day] = (dayTotalObj[day] || 0) + 1;
    }
  });

  if (minDate === null) return null;

  // add empty days within timeframe
  for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
    const day = formatDate(d);
    if (!dayTotalObj[day]) dayTotalObj[day] = 0;
  }

  let dayTotal = Object.keys(dayTotalObj).map((day) => {
    const date = new Date(day);
    date.setHours(0, 0, 0, 0);
    return { date: date, day: day, value: dayTotalObj[day] };
  });

  setData({
    day: { min: formatDate(minDate), max: formatDate(maxDate), data: dayTotal },
    weekday: weekday,
  });
  setLoadingData(false);
};

const addZ = (n) => {
  return n < 10 ? "0" + n : "" + n;
};

const formatDate = (date) => {
  return date.getFullYear() + "-" + addZ(date.getMonth() + 1) + "-" + addZ(date.getDate());
};

export default React.memo(TimeLine);
