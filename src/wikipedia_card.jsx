import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import styled from 'styled-components'

import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import SentimentBubble from './sentiment_bubble'

import blue from 'material-ui/colors/blue'
import lightBlue from 'material-ui/colors/lightBlue'
import blueGrey from 'material-ui/colors/blueGrey'
import green from 'material-ui/colors/green'
import grey from 'material-ui/colors/grey'

import { get } from 'lodash'

import {Link} from 'react-router-dom'

const SimpleLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`

const SentimentContainer = styled.div`
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 80px;
  padding-left: 20px;
`

class WikipediaCard extends Component {
  static defaultProps = {
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    this.state = {
      normalizedEntityName: props.entityName,
      image: 'http://thecatapi.com/api/images/get?format=src&type=gif',
      desc: 'loading...',
      loaded: false
    }
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(nextProps) {
    let entity = encodeURIComponent(nextProps.entityName)

    let url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${entity}&limit=1&format=json&redirects=resolve&origin=*`
    fetch(url).then( (response) => {
      return response.json()
    }).then((results) => {
      this.setState({loaded: true, desc: get(results, '[2][0]', '')})
    }).catch((reason) => {
      console.log(reason)
      this.setState({loaded: true, desc: reason.toString()})
      throw reason
    });

    let image = `https://en.wikipedia.org/w/api.php?action=query&titles=${entity}&prop=pageimages&format=json&pithumbsize=200&origin=*`
    fetch(image).then( (response) => {
      return response.json()
    }).then((results) => {
      let image = get( Object.values(results.query.pages), '[0].thumbnail.source', undefined)
      if (image !== undefined) {
        this.setState({image: image})
      }
    }).catch((reason) => {
      console.log(reason)
      throw reason
    });
  }




  render() {
    return (
      <div key={this.props.key} style={{zIndex: '999'}}>

      <Card style={{margin: '12px', minWidth: '250px', maxWidth: '250px', height: '350px'}}>
        <div style={{background: lightBlue['A700'], width: '10px', height: '350px', position: 'absolute'}}>
          <div style={{ background: blueGrey['200'], height: (1 - this.props.percentageBar)*350}}> 
          </div>
        </div>

        <CardMedia
          style={{height: '150px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center'}}
          image={this.state.image}
          title={this.props.entityName}
 
              

        />
        <CardContent>
          <Typography gutterBottom variant='headline' component='h4' style={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>
            {this.props.entityName}
          </Typography>
          <Typography component='p' style={{height: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            { this.state.desc.replace(/\s*\([^)]*\)+\s*/, ' ') }
          </Typography>

        </CardContent>
        <CardActions style={{justifyContent: 'space-between'}}>
          { this.state.loaded && ( this.props.selected !== true ? (
            <SimpleLink to={`/${this.props.dataKey}/${this.props.tab}/${this.props.entityName}`}>
              <Button size='small' variant="raised" style={{backgroundColor: lightBlue['A700'], color: blueGrey['50'], textTransform: 'none'}}>
                In {Math.round(100*this.props.percentageBar)}% of the results
              </Button>
            </SimpleLink> ) : (
            <SimpleLink to={`/${this.props.dataKey}/${this.props.tab}`}>
              <Button size='small' color="secondary">
                Show all
              </Button>
            </SimpleLink>)
          )}
          <SentimentContainer style={{margin: '-20px 0px 0px 0px'}}>
            <h6 style={{margin: 0, paddingBottom: 5}}>Perception</h6>
            <SentimentBubble polarity={this.props.sentiment.polarity} max={this.props.maxPolarity} min={this.props.minPolarity} positive={this.props.sentiment.positive} negative={this.props.sentiment.negative} name={this.props.entityName}/>
          </SentimentContainer>
        </CardActions>
        )
        )}
      </Card>
      </div>
    )
  }
}

export default WikipediaCard;
