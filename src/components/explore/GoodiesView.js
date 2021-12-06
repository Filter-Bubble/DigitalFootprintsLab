import React from "react";
import GoodiesDashboard from "./dashboards/GoodiesDashboard";

const SEARCHON = ["url", "title"];

const LAYOUT = {
  url: { type: "header", style: { color: "white" } },
  title: { type: "description", style: { color: "white" } },
  date: { type: "meta", style: { color: "white", fontStyle: "italic" } },
};

/**
 * Renders a HistoryDashboard for the browsing history data.
 * Note that this component is reached via the react router.
 * When the card on the home page is clicked, it navigates to /browsinghistory
 */
const GoodiesView = () => {
  return (
    <GoodiesDashboard
      searchOn={SEARCHON}
      layout={LAYOUT}
      table={"browsinghistory"}
      cloudKey={"domain"}
    />
  );
};

export default GoodiesView;
