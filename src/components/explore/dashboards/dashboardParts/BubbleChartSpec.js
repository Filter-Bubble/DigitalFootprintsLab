import { createClassFromSpec } from 'react-vega';

export default createClassFromSpec({spec: {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An example of a circle packing layout for hierarchical data.",
  "width": 500,
  "height": 500,
  "padding": 10,
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
        }
      ]
    }
  ],

  "signals": [
    {
      "name": "contextmenu",
      "value": {},
      "on": [
        { "events": "*:click", "update": "datum" }
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
          "strokeWidth": {"value": 0.5}
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
