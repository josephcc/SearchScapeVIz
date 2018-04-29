import React, { Component } from 'react'

import styled from 'styled-components'
import FlipMove from 'react-flip-move'

import Sentimood from './lib/sentimood.js'

import CssBaseline from 'material-ui/CssBaseline'
import Grid from 'material-ui/Grid'
import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import { SnackbarContent } from 'material-ui/Snackbar'

import AppBar from 'material-ui/AppBar'
import Tabs, { Tab } from 'material-ui/Tabs'

import Search from '@material-ui/icons/Search'
import blue from 'material-ui/colors/blue'
import green from 'material-ui/colors/green'
import grey from 'material-ui/colors/grey'
import deepPurple from 'material-ui/colors/deepPurple'
import lightBlue from 'material-ui/colors/lightBlue'

import WikipediaCard from './wikipedia_card.jsx'
import TreeMap from './treemap.jsx'

import data from './barcelona.json'
//import data from './angelina_jolie.json'
//import data from './obama.json'
//import data from './er.json'

import { uniq, flatten, countBy, sortBy } from 'lodash'

const Stopwords = ['me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'day', 'trip', 'trips', 'barcelona', 'spain', 'one', 'many', 'two', 'three', 'varies', 'very', 'take', 'get', 'best', 'also', 'visit']

const Title = styled(({className, children, ...props}) => (
  <a href={props.url} target='_blank' className={className}>
    <Typography variant='headline' component='h2'>
      {children}
    </Typography>
  </a>
))`
text-decoration: none;
> * {
  color: ${blue[800]} !important;
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
      focus: undefined,
      selectedTab: 0
    }
  }

	handleExploreEntity(tag) {
    console.log(tag)
    this.setState({focus: tag})
	}

  getComentionCounts(tag) {
    let index
    if (tag in this.props.table) {
      index = this.props.table[tag]
    } else if (tag.toLowerCase() in this.props.table) {
      index = this.props.table[tag.toLowerCase()]
    } else {
      return []
    }
    let winSize = 15
    let tokens = Object.keys(index).map((bidx) => {
      let starts = index[bidx]
      return uniq(starts.map((start) => {
        let end = start + winSize
        start = Math.max(0, start - winSize)
        return this.props.bookmarks[bidx].fulltext
          .slice(start, end)
          .map((t) => t.toLowerCase())
          .filter((t) => {
            if (t.length < 3)
              return false
            if (Stopwords.indexOf(t) >= 0)
              return false
            if (t === tag.toLowerCase() || tag.toLowerCase().indexOf(t) >= 0)
              return false
            return true
          })
      }))
    })
    tokens = countBy(flatten(flatten(tokens)))
    return sortBy(Object.keys(tokens), (t) => -tokens[t]).map((token) => {
      return [token, tokens[token]]
    })

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
    let winSize = 15
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


    let comentions = {
      name: '',
      score: 1,
      color: lightBlue['A100'],
      weight: 1,
      children: []
    }
    if (this.state.focus !== undefined) {
      comentions.children = this.getComentionCounts(this.state.focus)
        .filter((t) => t[1] >= 2)
        .slice(0, 9)
        .map((token_count) => {
        let token = token_count[0]
        let count = token_count[1]
        return {
          name: token,
          score: count,
          weight: count
        }
      })
    }

    return (<React.Fragment><CssBaseline />
			<Grid container spacing={8} alignItems='flex-end' style={{padding: '12px 32px 24px 24px'}}>
				<Grid item>
					<Search/>
				</Grid>
				<Grid item xs={4}>
					<TextField id='input-with-icon-grid' label='Search the Web' value='Day trips from Barcelona' style={{width: '100%'}} disabled/>
				</Grid>
			</Grid>

      
      <AppBar position="static" color="default">
				<Tabs
					value={this.state.selectedTab}
					onChange={this.handleChange}
					indicatorColor="secondary"
					textColor="primary"
					scrollable
					scrollButtons="auto"
				>
          {this.props.clusters.map((cluster, idx) => {
            return (<Tab label={
              cluster.name.replace(/^ *YAGO_yago/, '').replace(/^ *YAGO_[^_]+_/, '').replace(/ *\([^)]+\)/, '').replace(/_[0-9]*$/, '').replace(/_+/g, ' ').trim()
            } onClick={() => this.setState({selectedTab: idx})} key={`clusterTab.${idx}`}/>)
          })}
        </Tabs>
      </AppBar>

      <FlipMove duration={700} easing="ease-in-out" leaveAnimation='none' style={{display: 'flex', overflowX: 'auto', background: grey[800], padding: '8px', margin: '0px', minWidth: '100%'}}>
				{ this.props.clusters[this.state.selectedTab].tags.map((tag, idx) => {
          if (this.state.focus === undefined || this.state.focus === tag)
          return (
            <WikipediaCard
              entityName={tag}
              selected={tag === this.state.focus}
              onExploreEntity={this.handleExploreEntity.bind(this, tag)}
              onCancel={() => this.setState({focus: undefined})}
              key={`cluster.${this.state.selectedTab}.${idx}`}/>
          )
				})}
      </FlipMove>
      <div style={{position: 'relative', top: '-371px', marginBottom: '-371px', left: '300px'}} key='entity_global_viz_container'>
        <FlipMove duration={350} easing="ease-in-out" leaveAnimation='none' enterAnimation='fade'>
          {this.state.focus !== undefined && (
            <div key='entity_global_viz_container'>
              <div style={{color: 'white', fontSize: '1.1em'}}>Related Terms</div>
              <TreeMap width={200} height={332} transitionDuration={0} customScale={false}
                labelColor={'black'} fontSize={14} scoreInLabel={false}
                falseinnerPadding={4} corner={2} stroke={false}
                style={{}}
                data={comentions} onItemClick={(event, d) => {}}/>
            </div>
          )}
        </FlipMove>
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
