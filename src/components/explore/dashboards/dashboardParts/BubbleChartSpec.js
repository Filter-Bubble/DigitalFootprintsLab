import { createClassFromSpec } from 'react-vega';

export default createClassFromSpec({spec: {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An example of a circle packing layout for hierarchical data.",
  "width": 600,
  "height": 600,
  "padding": 5,
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
    }
  ]
}});
