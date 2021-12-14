import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import HeaderMenu from "./components/routing/HeaderMenu";
import "./App.css";

// login and authenticated route
import Welcome from "./components/routing/Welcome";
import AuthRoute from "./components/routing/AuthRoute";

// Main pages. Use below in items to include in header menu
import DataSquare from "./components/home/DataSquare";
import BrowsingHistory from "./components/explore/BrowsingHistory";
import YoutubeHistory from "./components/explore/YoutubeHistory";
import SearchHistory from "./components/explore/SearchHistory";
import GoodiesView from "./components/explore/GoodiesView";

// Change to add new components to the header
// The first item will be the opening page after login
const items = [
  { label: "Data square", path: `${process.env.PUBLIC_URL}/datasquare`, Component: DataSquare },
  { label: "Browsing History", path: `${process.env.PUBLIC_URL}/browsinghistory`, Component: BrowsingHistory },
  { label: "Search", path: `${process.env.PUBLIC_URL}/searchhistory`, Component: SearchHistory },
  { label: "Youtube", path: `${process.env.PUBLIC_URL}/youtube`, Component: YoutubeHistory },
  { label: "Goodies", path: `${process.env.PUBLIC_URL}/goodies`, Component: GoodiesView },
];

const App = () => {
  const createNavigation = (items) => {
    return items.map((item) => {
      return <AuthRoute key={item.path} path={item.path} Component={item.Component} />;
    });
  };

  return (
    <div style={{ background: "#0C1D35", height: "100%" }}>
      <BrowserRouter>
        <HeaderMenu items={items}>
          <Switch>
            <Route exact path={`${process.env.PUBLIC_URL}/`} render={() => <Welcome items={items} />} />
            {createNavigation(items)}
          </Switch>
        </HeaderMenu>
      </BrowserRouter>
    </div>
  );
};

export default App;
