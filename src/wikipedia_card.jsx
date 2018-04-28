import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

import styled from 'styled-components'

import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'

import blue from 'material-ui/colors/blue'
import green from 'material-ui/colors/green'
import grey from 'material-ui/colors/grey'

import { get } from 'lodash'


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
      this.setState({loaded: true, desc: results[2][0]})
    }).catch((reason) => {
      console.log(reason)
      this.setState({loaded: true, desc: reason})
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
      <div key={this.props.key}>
      <Card style={{margin: '12px', minWidth: '300px', maxWidth: '300px', height: '350px'}}>
        <CardMedia
          style={{height: '125px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top'}}
          image={this.state.image}
          title={this.props.entityName}
        />
        <CardContent>
          <Typography gutterBottom variant='headline' component='h2'>
            {this.props.entityName}
          </Typography>
          <Typography component='p' style={{height: '80px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            { this.state.desc.replace(/\s*\([^)]*\)+\s*/, ' ') }
          </Typography>
        </CardContent>
        { this.state.loaded && ( this.props.selected !== true ? (
          <CardActions>
            <Button onClick={this.props.onExploreEntity} size='small' variant="raised" color="primary">
              See mention
            </Button>
          </CardActions>
        ) : (
          <CardActions>
            <Button onClick={this.props.onCancel} size='small' color="secondary">
              Cancel
            </Button>
          </CardActions>
        )
        )}
      </Card>
      </div>
    )
  }
}

export default WikipediaCard;
