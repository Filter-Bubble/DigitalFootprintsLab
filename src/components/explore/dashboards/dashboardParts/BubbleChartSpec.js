import { createClassFromSpec } from 'react-vega';

export default createClassFromSpec({spec: {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "width": 700,
  "height": 420,
  "padding": 0,
  "autosize": "none",

  "data": [
    {
      "name": "tree",
      "transform": [
        {
          "type": "stratify",
          "key": "name",
          "parentKey": "parent"
        },
        {
          "type": "pack",
          "field": "count",
          "sort": {"field": "count"},
          "size": [{"signal": "width"}, {"signal": "height"}]
        },
        {
          "type": "filter",
          "expr": "datum.name != 'root'"
        }
      ]
    }
  ],

  "signals": [
    {
      "name": "selectedDatum",
      "value": {},
      "on": [
        { "events": "click", "update": "datum", "force": "true" }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "ordinal",
      "domain": {"data": "tree", "field": "depth"},
      "range": {"scheme": "category20"}
    }
  ],

  "marks": [
    {
      "type": "symbol",
      "from": {"data": "tree"},
      "encode": {
        "enter": {
          "shape": {"value": "circle"},
          "fill": {"scale": "color", "field": "depth"},
          "tooltip": {"signal": "datum.name + (datum.size ? ', ' + datum.size + ' bytes' : '')"}
        },
        "update": {
          "x": {"field": "x"},
          "y": {"field": "y"},
          "size": {"signal": "4 * datum.r * datum.r"},
          "stroke": {"value": "white"},
          "strokeWidth": {"value": 0.8}
        },
        "hover": {
          "stroke": {"value": "red"},
          "strokeWidth": {"value": 2}
        }
      }
    },
    // {
    //   "type": "image",
    //   "from": {"data": "tree"},
    //   "encode": {
    //     "enter": {
    //       "url": {"signal": "datum.count > 500 ? '/favicon/' + datum.name + '.ico' : ''"},
    //       "x": {"field": "x"},
    //       "y": {"field": "y"},
    //       "width": {"value": 32},
    //       "height": {"value": 32},
    //     },
    //     "update": {
    //     }
    //   }
    // }
  ]
}});
