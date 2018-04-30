import React from 'react'
import ReactDOM from 'react-dom'

let d3 = Object.assign({},
  require('d3-scale'),
  require('d3-axis'),
  require('d3-selection'),
  require('d3-array'),
  require('d3-color'),
)

export default class BarChart extends React.Component {

  static defaultProps = {
    width: 700,
    height: 300,
    mode: 'bars'
  }

  constructor(props) {
    super(props)
  }

  initD3(element) {

    let color = d3.hsl(this.props.color)
    color.l = 0.8

    let margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = this.props.width - margin.left - margin.right,
        height = this.props.height - margin.top - margin.bottom


    let endColor = d3.hsl(this.props.color)
    let startColor = d3.hsl(this.props.color)
    let neutralColor = d3.hsl(this.props.color)

    //endColor = d3.hsl('gray')
    //startColor = d3.hsl('gray')

    startColor.l = 0.99
    endColor.l = 0.50
    neutralColor.l = 0.7

    let colorScale = d3.scaleLinear()
    colorScale.range([startColor, endColor])
    colorScale.domain([d3.min(this.props.data, (d) => d.y), d3.max(this.props.data, (d) => d.y)])

    d3.select(element).select('svg').remove()
    let svg = d3.select(element).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.0)
        .domain(this.props.data.map((d) => d.x))

    let y = d3.scaleLinear()
      .domain([0, this.props.max])
      .range([0, (height - 4)/2])

    this.bars = svg.selectAll(".bar")
        .data(this.props.data)
    this.bars.exit().remove()

    this.labels = svg.selectAll(".label")
        .data(this.props.data)
    this.labels.exit().remove()

    if (this.props.mode === 'bubbles') {
      this.bars = this.bars
        .enter().append("circle")
        .merge(this.bars)
        .attr("class", "bar hoverPointer")
        .attr("r", (d) => y(d.y))
        .attr("cx", (d) => x(d.x) + (x.bandwidth()/2))
        .attr("cy", (d) => height/2)
        .attr("fill", color)
    } else if (this.props.mode === 'bars'){
      this.bars = this.bars
        .enter().append("rect")
        .merge(this.bars)
        .attr("class", "bar hoverPointer")
        .attr("x", (d) => x(d.x)+2)
        .attr("y", (d) => 0+2 + height - (y(d.y)*2))
        .attr('rx', 2)
        .attr('ry', 2)
        .attr("width", (d) => x.bandwidth()-4)
        .attr("height", (d) => y(d.y) * 2)
        .attr("fill", this.props.color)

      this.labels = this.labels
        .enter().append("text")
        .merge(this.labels)
        .attr("class", "label hoverPointer")
        .attr("x", (d) => x(d.x)+2)
        .attr("y", (d) => 0+2 + height - (y(d.y)*2))
        .text((d) => d.x)

    } else if (this.props.mode === 'squares'){
      this.bars = this.bars
        .enter().append("rect")
        .merge(this.bars)
        .attr("class", "bar hoverPointer")
        .attr("x", (d) => x(d.x)+2)
        .attr("y", (d) => 0+2)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr("width", (d) => x.bandwidth()-4)
        .attr("height", (d) => x.bandwidth()-4)
        .attr("fill", (d) => colorScale(d.y))
    } else if (this.props.mode === 'squaresize'){
      this.bars = this.bars
        .enter().append("rect")
        .merge(this.bars)
        .attr("class", "bar hoverPointer")
        .attr("x", (d) => x(d.x)+2 + (x.bandwidth() - 4 - 2*y(d.y))/2)
        .attr("y", (d) => 0+2 + (x.bandwidth() - 4 - 2*y(d.y))/2)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr("width", (d) => y(d.y) * 2)
        .attr("height", (d) => y(d.y) * 2)
        .attr("fill", neutralColor)
    }
    this.bars
        .attr('data-tip', (d) => d.xtitle)
        .attr('data-for', this.props.idTooltip)
        .on('click', (d) => {this.props.onClick(d)})

  }

  updateD3() {
    if (this.props.highlight !== undefined) {
      this.bars.attr("stroke", (d) => { 
          if (d.x === this.props.highlight + 1) 
            return 'black'
          return 'gray'
        })
        .attr("stroke-width", (d) => { 
          if (d.x === this.props.highlight + 1) 
            return 1
          return 0.5
        })
    }
  }

  componentDidUpdate() {
    this.updateD3()
  }

  componentDidMount() {
    this.initD3(ReactDOM.findDOMNode(this.refs.barchart))
    this.updateD3()
  }

  render() {
    return (
      <div className='barchart' ref='barchart' style={{backgroundColor: this.props.background}}></div>
    )
  }
}
