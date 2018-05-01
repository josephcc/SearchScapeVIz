import React from 'react'
import ReactDOM from 'react-dom'

let d3 = Object.assign({},
  require('d3-scale'),
  require('d3-axis'),
  require('d3-selection'),
  require('d3-ease'),
  require('d3-transition'),
  require('d3-array'),
  require('d3-color'),
)

export default class BarChart extends React.Component {

  static defaultProps = {
    width: 700,
    height: 300,
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
    this.svg = d3.select(element).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    this.x = d3.scaleBand()
        .range([0, width])
        .padding(0.0)
        .domain(this.props.data.map((d) => d.x))

    this.y = d3.scaleSqrt()
      .domain([0, this.props.max])
      .range([0, (height - 4)/2])


    this.bars = this.svg.selectAll(".bar")
      .data(this.props.data)
    this.bars.exit().remove()

    this.bars = this.bars
      .enter().append("rect")
      .merge(this.bars)
      .attr("class", "bar hoverPointer")
      .on('click', (d) => {this.props.onClick(d)})

   this.bars
      .attr("x", (d) => this.x(d.x)+2)
      .attr("y", (d) => 0+2 + this.props.height - (this.y(d.y)*2))
      .attr('rx', 2)
      .attr('ry', 2)
      .attr("width", (d) => this.x.bandwidth()-4)
      .attr("height", (d) => this.y(d.y) * 2)
      .attr("fill", this.props.color)

    this.labels = this.svg.selectAll(".label")
        .data(this.props.data)
    this.labels.exit().remove()


    this.labels = this.labels
      .enter().append("text")
      .merge(this.labels)
      .attr("class", "label hoverPointer")
      .attr("x", (d) => this.x(d.x) + (this.x.bandwidth()/2) + 4)
      .attr("y", height - 4)
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .attr("transform", (d) => `rotate(-90 ${this.x(d.x) + (this.x.bandwidth()/2) + 4} ${height - 4})`)
      .text((d) => d.x)

  }

  updateD3() {
    this.bars = this.svg.selectAll(".bar")
      .data(this.props.data)
    this.bars.exit().remove()

    this.bars = this.bars
      .enter().append("rect")
      .merge(this.bars)
      .attr("class", "bar hoverPointer")
      .on('click', (d) => {this.props.onClick(d)})

   this.bars
      .transition().duration(150).ease(d3.easeSin)
      .attr("x", (d) => this.x(d.x)+2)
      .attr("y", (d) => 0+2 + this.props.height - (this.y(d.y)*2))
      .attr('rx', 2)
      .attr('ry', 2)
      .attr("width", (d) => this.x.bandwidth()-4)
      .attr("height", (d) => this.y(d.y) * 2)
      .attr("fill", this.props.color)

    if (this.props.highlight !== undefined) {
      this.bars.attr("stroke", (d) => { 
          if (d.name === this.props.highlight) 
            return 'black'
          return 'gray'
        })
        .attr("stroke-width", (d) => { 
          if (d.name === this.props.highlight) 
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
  }

  render() {
    return (
      <div className='barchart' ref='barchart' style={{backgroundColor: this.props.background}}></div>
    )
  }
}
