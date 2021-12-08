import React from "react";
import HistoryDashboard from "./dashboards/HistoryDashboard";

const SEARCHON = ["channel", "title"];

const LAYOUT = [ "date", "channel", "title" ];

/**
 * Renders a HistoryDashboard for the youtube history data.
 * Note that this component is reached via the react router.
 * When the card on the home page is clicked, it navigates to /youtube
 */
const YoutubeHistory = () => {
  return (
    <HistoryDashboard searchOn={SEARCHON} layout={LAYOUT} table={"youtube"} cloudKey={"channel"} />
  );
};

export default YoutubeHistory;
