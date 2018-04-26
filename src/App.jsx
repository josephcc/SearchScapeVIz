import React, { Component } from 'react'

import styled from 'styled-components'

import Sentimood from './lib/sentimood.js'

import CssBaseline from 'material-ui/CssBaseline'
import Grid from 'material-ui/Grid'
import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import { SnackbarContent } from 'material-ui/Snackbar'

import Search from '@material-ui/icons/Search'
import blue from 'material-ui/colors/blue'
import green from 'material-ui/colors/green'
import grey from 'material-ui/colors/grey'

import WikipediaCard from './wikipedia_card.jsx'
import data from './barcelona.json'

const Title = styled(({className, children, ...props}) => (
  <a href={props.url} target='_blank' className={className}>
    <Typography variant='headline' component='h2'>
      {children}
    </Typography>
  </a>
))`
text-decoration: none;
> * {
  color: ${blue[500]} !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`

const Url = styled(({className, children, ...props}) => (
  <a href={props.url} target='_blank' className={className}>
    <Typography>
      { props.url.replace(/https?:\/\/(www\.)?/, '').replace(/\/+$/, '') }
    </Typography>
  </a>
))`
text-decoration: none;
> * {
  color: ${green[500]} !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`


class App extends Component {
  static defaultProps = {
    ...data
  }

  constructor(props) {
    super(props)
    this.state = {
      focus: undefined
    }
  }

	handleExploreEntity(tag) {
    console.log(tag)
    this.setState({focus: tag})
	}

  getDesc(idx) {
    let bookmark = this.props.bookmarks[idx]
    if (this.state.focus === undefined) {
      return bookmark.desc
    }
    let index = []
    if (this.state.focus in this.props.table && idx in this.props.table[this.state.focus]) {
      index = this.props.table[this.state.focus][idx]
    } else if (this.state.focus.toLowerCase() in this.props.table && idx in this.props.table[this.state.focus.toLowerCase()]) {
      index = this.props.table[this.state.focus.toLowerCase()][idx]
    }
    let winSize = 30
    return (
      <span>
        { index.map((start, idx) => { 
          if (idx !== 0 && start - index[idx-1] > winSize) {
            return
          }
          let sentiment = Sentimood.analyze(bookmark.fulltext.slice(Math.max(0, start - winSize), start+winSize).join(' '))
          return (
            <span style={{display: 'block', marginBottom: '8px'}} key={`mentions.${start}.${idx}`}>
              <span>...{bookmark.fulltext.slice(Math.max(0, start - winSize), index[0]).join(' ')}</span>
              <span style={{color: 'red'}}> {bookmark.fulltext[start]} </span>
              <span>{bookmark.fulltext.slice(start - 1, start + winSize).join(' ')}...</span>
              <pre>{JSON.stringify(sentiment, null, 2)}</pre>
            </span>
          )
      })}
      </span>
    )
  }

  render() {
    let index = undefined
    if (this.state.focus !== undefined) {
      index = this.props.table[this.state.focus.toLowerCase()]
    }
    return (<React.Fragment><CssBaseline />
			<Grid container spacing={8} alignItems='flex-end' style={{padding: '12px 32px 0px 24px'}}>
				<Grid item>
					<Search/>
				</Grid>
				<Grid item xs={4}>
					<TextField id='input-with-icon-grid' label='Search the Web' value='Day trips from Barcelona' style={{width: '100%'}} disabled/>
				</Grid>
			</Grid>

      <div style={{display: 'flex', overflowX: 'auto', background: grey[800], padding: '8px', margin: '24px 0px'}}>
				{ this.props.clusters[0].tags.map((tag, idx) => {
          return (
            <WikipediaCard entityName={tag} selected={tag === this.state.focus} onExploreEntity={this.handleExploreEntity.bind(this, tag)} key={`cluster.0.tag.${idx}`}/>
          )
				})}
      </div>

      <div style={{display: 'flex'}}>

        <div style={{padding: '32px', maxWidth: '600px'}}>
          <Grid container spacing={24}>
            { this.state.focus !== undefined && (
              <Grid item xs={12}>
                <SnackbarContent message={`Showing mentions of "${this.state.focus}".`} action={(
                  <Button color="secondary" size="small" onClick={() => this.setState({focus: undefined})}>Cancel</Button>
                )} />
              </Grid>
            )}
            <Grid item xs={12}>
              { this.props.bookmarks.map((bookmark, idx) => {
                if (index !== undefined && !(idx in index)) {
                  return
                }
                return (
                  <Card style={{padding: '4px', margin: '12px'}} key={`bookmark.${idx}`}>
                    <CardContent>
                      <Title url={bookmark.url}>{bookmark.title}</Title>
                      <Url url={bookmark.url}/>
                      <Typography component='p' style={{marginTop: '12px'}}>
                        { this.getDesc(idx) }
                      </Typography>
                    </CardContent>
                  </Card>
                )
              }) }
            </Grid>
          </Grid>
        </div>

      </div>

    </React.Fragment>);
  }
}

export default App
