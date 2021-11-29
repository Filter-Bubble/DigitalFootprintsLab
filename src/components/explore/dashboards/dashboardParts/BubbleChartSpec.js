import { createClassFromSpec } from 'react-vega';

export default createClassFromSpec({spec: {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "description": "An example of a circle packing layout for hierarchical data.",
  "width": 800,
  "height": 800,
  "padding": 5,
  "autosize": "none",

  "signals": [
    {
      "name": "xoffset",
      "update": "-(height + padding.bottom)"
    },
    {
      "name": "yoffset",
      "update": "-(width + padding.left)"
    },
    { "name": "xrange", "update": "[0, width]" },
    { "name": "yrange", "update": "[height, 0]" },

    {
      "name": "down", "value": null,
      "on": [
        {"events": "touchend", "update": "null"},
        {"events": "mousedown, touchstart", "update": "xy()"}
      ]
    },
    {
      "name": "xcur", "value": null,
      "on": [
        {
          "events": "mousedown, touchstart, touchend",
          "update": "slice(xdom)"
        }
      ]
    },
    {
      "name": "ycur", "value": null,
      "on": [
        {
          "events": "mousedown, touchstart, touchend",
          "update": "slice(ydom)"
        }
      ]
    },
    {
      "name": "delta", "value": [0, 0],
      "on": [
        {
          "events": [
            {
              "source": "window", "type": "mousemove", "consume": true,
              "between": [{"type": "mousedown"}, {"source": "window", "type": "mouseup"}]
            },
            {
              "type": "touchmove", "consume": true,
              "filter": "event.touches.length === 1"
            }
          ],
          "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
        }
      ]
    },

    {
      "name": "anchor", "value": [0, 0],
      "on": [
        {
          "events": "wheel",
          "update": "[invert('xscale', x()), invert('yscale', y())]"
        },
        {
          "events": {"type": "touchstart", "filter": "event.touches.length===2"},
          "update": "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]"
        }
      ]
    },
    {
      "name": "zoom", "value": 1,
      "on": [
        {
          "events": "wheel!",
          "force": true,
          "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
        },
        {
          "events": {"signal": "dist2"},
          "force": true,
          "update": "dist1 / dist2"
        }
      ]
    },
    {
      "name": "dist1", "value": 0,
      "on": [
        {
          "events": {"type": "touchstart", "filter": "event.touches.length===2"},
          "update": "pinchDistance(event)"
        },
        {
          "events": {"signal": "dist2"},
          "update": "dist2"
        }
      ]
    },
    {
      "name": "dist2", "value": 0,
      "on": [{
        "events": {"type": "touchmove", "consume": true, "filter": "event.touches.length===2"},
        "update": "pinchDistance(event)"
      }]
    },

    {
      "name": "xdom", "update": "slice(xext)",
      "on": [
        {
          "events": {"signal": "delta"},
          "update": "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]"
        },
        {
          "events": {"signal": "zoom"},
          "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
        }
      ]
    },
    {
      "name": "ydom", "update": "slice(yext)",
      "on": [
        {
          "events": {"signal": "delta"},
          "update": "[ycur[0] + span(ycur) * delta[1] / height, ycur[1] + span(ycur) * delta[1] / height]"
        },
        {
          "events": {"signal": "zoom"},
          "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
        }
      ]
    },
    {
      "name": "size",
      "update": "width / span(xdom)"
    }
  ],

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
        { "type": "extent", "field": "x", "signal": "xext" },
        { "type": "extent", "field": "y", "signal": "yext" }
      ]
    }
  ],

  "scales": [
    {
      "name": "color",
      "type": "ordinal",
      "domain": {"data": "tree", "field": "depth"},
      "range": {"scheme": "category20"}
    },
    {
      "name": "xscale", "zero": false,
      "domain": {"signal": "xdom"},
      "range": {"signal": "xrange"}
    },
    {
      "name": "yscale", "zero": false,
      "domain": {"signal": "ydom"},
      "range": {"signal": "yrange"}
    }
  ],

  "marks": [
    {
      "type": "symbol",
      "from": {"data": "tree"},
      "clip": true,
      "encode": {
        "enter": {
          "shape": {"value": "circle"},
          "fill": {"scale": "color", "field": "depth"},
          "tooltip": {"signal": "datum.name + ' ' + datum.count"}
        },
        "update": {
          "x": {"scale": "xscale", "field": "x"},
          "y": {"scale": "yscale", "field": "y"},
          "size": {"signal": "4 * datum.r * datum.r * size * size"},
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
