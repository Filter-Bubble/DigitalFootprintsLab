import db from "apis/dexie";
import { DateTime } from "luxon";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Container, Dimmer, Header, Item, Loader, Card } from "semantic-ui-react";


const propTypes = {
  /** An array with row IDs to filter on */
  selection: PropTypes.array,
  /** A string to indicate the loading status */
  loading: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
};

const FunFacts = ({selection, loading}) => {
  const [data, setData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchFromDb(setData, setLoadingData, selection);
  }, [selection, setData]);

  return (
    <Container>
      <Dimmer active={loading || loadingData}>
        <Loader />
      </Dimmer>
      <Header as="h1" align={"center"} style={{ color: "white" }}>
        Fun Facts
      </Header>
      <Card.Group centered>
        <Card>
          <Card.Content>
            <Card.Header>Most active</Card.Header>
            <Card.Description>Your most active day online is <b>{data.most_active_day}</b></Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Wake up</Card.Header>
            <Card.Description>You usually start browsing at <b>{data.typical_start}</b></Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Sleep</Card.Header>
            <Card.Description>You usually stop browsing at <b>{data.typical_end}</b></Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Most visits</Card.Header>
            <Card.Description>On <b>{data.most_visits_day}</b> you visited <b>{data.most_visits_in_1_day}</b> websites!</Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Taking a break</Card.Header>
            <Card.Description>The longest period between visits is <b>{data.most_days_between_visits} days</b></Card.Description>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Card.Header>Morning person?</Card.Header>
            <Card.Description>50% of your browsing happens after <b>{data.middle_point}</b></Card.Description>
          </Card.Content>
        </Card>
      </Card.Group>
    </Container>
  );
};

const fetchFromDb = async (setData, setLoadingData, selection) => {
  setLoadingData(true);
  db.getDataFrame(selection).then(stats => {
    const facts = {};

    // Calculate the most active day of the week
    const days = stats.groupBy("day");
    const dayCount = days.aggregate(group => group.count()).rename('aggregation', 'count')
    const m = dayCount.stat.max('count');
    const mostBusyDay = dayCount.filter(row => row.get("count") === m).getRow(0).get('day');
    const dayName = new Date(0, 0, mostBusyDay).toLocaleDateString('default',{weekday: 'long'});

    facts['most_active_day'] = dayName;

    // Calculate the earliest and latest activity on average
    const timeGroup = stats.groupBy("dateOnly");
    const minTime = timeGroup.aggregate(group => group.stat.min('time')).rename("aggregation", "mintime");
    const maxTime = timeGroup.aggregate(group => group.stat.max('time')).rename("aggregation", "maxtime");

    const avgmintime = minTime.stat.mean('mintime');
    const avgmaxtime = maxTime.stat.mean('maxtime');

    facts['typical_start'] = new Date(avgmintime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    facts['typical_end'] = new Date(avgmaxtime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    // Calculate the most sites in 1 day
    const mostVisits = timeGroup.aggregate(group => group.count()).rename("aggregation", "count");
    const mV = mostVisits.stat.max('count');
    const mostVisitsDay = mostVisits.filter(row => row.get("count") === mV).getRow(0).get('dateOnly');
    const mostVisitsDayName = mostVisitsDay.toLocaleDateString('default',{weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});

    facts['most_visits_day'] = mostVisitsDayName;
    facts['most_visits_in_1_day' ] = mV;

    // Calculate the longest period without visits
    let maxDiff = 0;
    for (let i=1; i < stats.count(); i++) {
      const d1 = DateTime.fromJSDate(stats.getRow(i-1).get("date"));
      const d2 = DateTime.fromJSDate(stats.getRow(i).get("date"));
      const diffInDays = d2.diff(d1, 'days');
      if (diffInDays.days > maxDiff) {
        maxDiff = diffInDays.days;
      }
    }

    facts['most_days_between_visits'] = Math.round(maxDiff);

    // Locate halfway point
    const timing = stats.sortBy('time');
    const middle = timing.getRow(Math.floor(stats.count()/2));
    const mid_time = middle.get("time").toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    facts['middle_point'] = mid_time;

    setData(facts);
    setLoadingData(false);
  })
};

FunFacts.propTypes = propTypes;
export default FunFacts