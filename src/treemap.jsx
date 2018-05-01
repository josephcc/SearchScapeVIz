import React from 'react'
import ReactDOM from 'react-dom'

import red from 'material-ui/colors/red'
import purple from 'material-ui/colors/purple'
import textures from 'textures'

import { sumBy } from 'lodash'
import {event as currentEvent} from 'd3-selection'

let d3 = Object.assign({},
  require('d3-scale'),
  require('d3-axis'),
  require('d3-selection'),
  require('d3-array'),
  require('d3-ease'),
  require('d3-hierarchy'),
  require('d3-transition'),
  require('d3-color'),
)


export default class TreeMap extends React.Component {

  static defaultProps = {
    width: 100,
    height: 100,
    margin: 0,
    transitionDuration: 1000,
    innerPadding: 5,
    outerPadding: 1,
    corner: 5,
    stroke: true,
    strokeColor: 'gray',
    fontSize: 10,
    emptyColor: 'white',
    customScale: false,
    labelColor: 'black',
    tile: undefined,
  }

  constructor(props) {
    super(props)
  }

	wrap(self, width) {
	} 

  initD3(element) {
    d3.select(element).select('svg').remove()
    this.svg = d3.select(element).append('svg')
      .attr('width', this.props.width - 2*this.props.margin)
      .attr('height', this.props.height - 2*this.props.margin)
      .append('g')
      .attr("transform", "translate(" + this.props.margin + "," + this.props.margin + ")")

    this.emptyTexture = textures.lines()
      .size(6)
      .strokeWidth(1)
      .stroke('lightgray')
      .background('white')

    this.negativeTexture = textures.lines()
      .size(6)
      .strokeWidth(3)
      .stroke('lightsalmon')
      .background('white')

    this.svg.call(this.emptyTexture)
    this.svg.call(this.negativeTexture)

    this.init = true
  }

  update() {
    let root = d3.hierarchy(this.props.data)
    let posSum = sumBy(this.props.data.children, (d) => Math.max(0, d.weight))
    let perc = 0.08
    let negN = sumBy(this.props.data.children, (d) => (d.weight < 0 ? 1 : 0))
    let negSize = perc * posSum / (1 - (perc * negN))

    root.sum((d) => {
      if (posSum <= 0)
        return 1
      if (d.weight <= 0)
        return negSize
      return d.weight
    })
    root.sort((a, b) => b.weight - a.weight)

    let tile = d3.treemapSquarify.ratio((this.props.width - 2*this.props.margin) / (this.props.height - 2*this.props.margin))
    if (this.props.tile !== undefined) {
      tile = this.props.tile
    }

    let treemap = d3.treemap()
      .paddingInner(this.props.innerPadding)
      .paddingOuter(this.props.outerPadding)
    //.tile(d3.treemapBinary)
    //.tile(d3.treemapResquarify)
    .tile(d3.treemapSlice)
    //.tile(tile)
    .size([this.props.width - 2*this.props.margin, this.props.height - 2*this.props.margin])
    

    treemap(root)

    let wratio = (this.props.width - 2*this.props.margin - 2*this.props.outerPadding) / Math.max(...root.leaves().map((d) => d.x1))
    let hratio = (this.props.height- 2*this.props.margin - 2*this.props.outerPadding) / Math.max(...root.leaves().map((d) => d.y1))

    let endColor = d3.hsl(this.props.data.color)
    let startColor = d3.hsl(this.props.data.color)
    startColor.l = 0.9
    endColor.l = 0.7

    let colorScale = d3.scaleLinear()
    let _scores = this.props.data.children.map((c) => c.score).filter((c) => c > 0)
    if (_scores.length !== 0) {
      colorScale.domain([0, Math.min(..._scores), Math.max(..._scores)])
        .range([this.props.emptyColor, startColor, endColor])
    } else {
      colorScale.domain([Math.min(..._scores), Math.max(..._scores)])
        .range(['white', 'white'])
    }

    this.cells = this.svg.selectAll('.cell')
        .data(root.leaves())

    this.cells.exit().remove()

    this.cells = this.cells
      .enter().append('rect')
      .merge(this.cells)
        .attr('class', 'cell hoverPointer')
        .attr('x', (d) => d.x0 * wratio)
        .attr('y', (d) => d.y0 * hratio)
        .attr('width', (d) => (d.x1 - d.x0) * wratio)
        .attr('height', (d) => (d.y1 - d.y0) * hratio)
        .attr('rx', this.props.corner)
        .attr('ry', this.props.corner)
        .attr('stroke', (d) => {
          if (d.data.highlight === true) {
            return purple['A100']
          }
          return this.props.strokeColor
        })
        .attr('stroke-width', (d) => {
          if (d.data.highlight === true) {
            return 2.0
          }
          if (d.data.score <= 0) {
            return 0.5
          }
          return (this.props.stroke ? 1 : 0)
        })
      .on('click', (d, e) => {
        this.props.onItemClick(currentEvent, d.data)
      })
      .on('mouseover', (d, e) => {
        this.props.onItemHover(currentEvent, d.data, true)
      })

    if (this.init === true) {
      this.cells
        .attr('fill', (d) => {
          if (d.data.weight < 0)
            return this.negativeTexture.url()
          this.emptyTexture.url()
        })
      this.init = false
    }


    if (this.props.transitionDuration > 0) {
      this.cells
        .transition().duration(this.props.transitionDuration).ease(d3.easeSin)
        .attr('fill', (d) => {
          if (d.data.weight < 0)
            return this.negativeTexture.url()
          if (d.data.score === 0)
            return this.emptyTexture.url()
          if (this.props.customScale)
            return d.data.colorScale(d.data.score)
          return colorScale(d.data.score)
        })
    } else {
      this.cells
        .attr('fill', (d) => {
          if (d.data.weight < 0)
            return this.negativeTexture.url()
          if (d.data.score === 0)
            return this.emptyTexture.url()
          if (this.props.customScale)
            return d.data.colorScale(d.data.score)
          return colorScale(d.data.score)
        })
    }

    this.labels = this.svg.selectAll(".labels")
        .data(root.leaves())

    this.labels.exit().remove()

    this.labels
      .enter().append("text")
      .merge(this.labels)
        .attr("class", "labels hoverPointer")
        .attr('font-weight', 'bold')
        .attr("fill", this.props.labelColor)
        .attr('text-anchor', "middle")
        .attr('alignment-baseline', "middle")
        .attr('font-size', this.props.fontSize)
        .attr("x", (d) => d.x0*wratio + ((d.x1 - d.x0)*wratio/2))
        .attr("y", (d) => d.y0*hratio + ((d.y1 - d.y0)*hratio/2))
        .on('click', (d) => this.props.onItemClick(currentEvent, d.data))
        .on('mouseover', (d) => this.props.onItemHover(currentEvent, d.data, true))
        .text((d) => {
          if(this.props.scoreInLabel === true) {
            return `${d.data.name} (${Math.round(d.data.score)})`
          }
          return d.data.name
        }).each(function (d) {
          let self = d3.select(this)
          let textLength = self.node().getComputedTextLength()
          let text = self.text()
          let width = (d.x1 - d.x0) * wratio
          width -= 2
          while (textLength > width && text.length > 0) {
            text = text.slice(0, -1);
            self.text(text)
            textLength = self.node().getComputedTextLength()
          }
        })

    this.labels
      .append('tspan')
        .attr('font-size', this.props.fontSize/1.1)
        .attr('font-weight', 'bold')
        .attr('dy', -this.props.fontSize/4)
        .text((d) => d.data.sup)


    if (this.props.tooltips) {
      this.cells
        .attr('data-tip', (d) => {
          if (d.data.score <= 0 || d.data.weight <= 0) {
            return `${d.data.name}<br/>no mentions`
          }
          return `${d.data.name}<br/>click to show mentions`
        })
        .attr('data-for', this.props.idTooltip)
        .attr('data-offset', (d) => JSON.stringify({
          top: -(d.y1 - d.y0)*hratio,
          left: -((d.x1-d.x0)*wratio)/2
        }))

      this.labels
        .attr('data-tip', (d) => {
          if (d.data.score <= 0 || d.data.weight <= 0) {
            return `${d.data.name}<br/>no mentions`
          }
          return `${d.data.name}<br/>click to show mentions`
        })
        .attr('data-for', this.props.idTooltip)
        .attr('data-offset', (d) => JSON.stringify({
          top: -(d.y1 - d.y0)/2,
          left: d.x0
        }))
    }


  }

  componentDidUpdate() {
    this.update()
  }

  componentDidMount() {
    this.initD3(ReactDOM.findDOMNode(this.refs.treemap))
    this.update()
  }

  render() {
    return (<div
      className='treemap'
      ref='treemap'
      style={{display: 'inline-block', backgroundColor: this.props.background}}
      onMouseLeave={this.props.onItemHover.bind(this, currentEvent, undefined, false)}
    />)
  }
}
