import React from 'react'
import styled from 'styled-components'
const d3 = Object.assign({},
  require('d3-scale'),
  require('d3-axis'),
  require('d3-selection'),
  require('d3-ease'),
  require('d3-transition'),
  require('d3-array'),
  require('d3-color'),
)

const maxR = 10;
const Root = styled.div`
  text-align: center;
  overflow: visible;  
`

export default class SentimentBubble extends React.Component {
  
  normalize(val, max, min) { 
    return (val - min) / (max - min); 
  }

  componentDidMount() {
    let {polarity, max, min, negative, positive, name} = this.props;
    name = name.replace(/\s/g, "");
    var r = (this.normalize(polarity, max, min) * maxR) + 10;
    var total = negative + positive;
    var percent = Math.trunc((positive / total) * 100) || 0;
    var svg = d3.select(this.ref).append("svg")
              .attr("width", r*2)
              .attr("height", r*2);

    var grad = svg.append("defs").append("linearGradient").attr("id", name)
        .attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "0%");
    grad.append("stop").attr("offset", `${percent}%`).style("stop-color", "#a5d6a7");
    grad.append("stop").attr("offset", `${percent}%`).style("stop-color", "#ef9a9a");

    svg.append("circle")
        .attr("cx", r)
        .attr("cy", r)
        .attr("r", r)
        .attr("stroke", "none")
        .attr("fill", `url(#${name})`);

//    svg.append("text")
//        .attr("dx", r)
//      .attr("dy", r)
//      .attr("text-anchor", "middle")
//      .attr("stroke", "white")
//      .attr("fill", "white")
//      .text("test")
  }
  
  render() {
    return <Root innerRef={ref => this.ref = ref} />
  }
}