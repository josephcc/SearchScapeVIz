import React, { Component } from 'react'

import styled from 'styled-components'
import FlipMove from 'react-flip-move'

import { Sentimood, AFINN } from './lib/sentimood.js'

import CssBaseline from 'material-ui/CssBaseline'
import Grid from 'material-ui/Grid'
import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import { SnackbarContent } from 'material-ui/Snackbar'
import SelectField from 'material-ui/Select';
import MenuItem from 'material-ui/Menu/MenuItem';

import AppBar from 'material-ui/AppBar'
import Tabs, { Tab } from 'material-ui/Tabs'

import Search from '@material-ui/icons/Search'
import red from 'material-ui/colors/red'
import blue from 'material-ui/colors/blue'
import green from 'material-ui/colors/green'
import grey from 'material-ui/colors/grey'
import deepPurple from 'material-ui/colors/deepPurple'
import lightBlue from 'material-ui/colors/lightBlue'

import WikipediaCard from './wikipedia_card.jsx'
import TreeMap from './treemap.jsx'
import BarChart from './bar_chart.jsx'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { uniq, flatten, countBy, sortBy, zipObject, get, reduce, forEach} from 'lodash'

const WinSize = 20
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

const SimpleLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      comention: undefined,
      comentionHover: undefined
    }
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
    let tokens = Object.keys(index).map((bidx) => {
      let starts = index[bidx]
      return uniq(starts.map((start) => {
        let end = start + WinSize
        start = Math.max(0, start - WinSize)
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

  _getIndex(tag, idx) {
      let index = []
      if (tag in this.props.table && idx in this.props.table[tag]) {
        index = this.props.table[tag][idx]
      } else if (tag.toLowerCase() in this.props.table && idx in this.props.table[tag.toLowerCase()]) {
        index = this.props.table[tag.toLowerCase()][idx]
      }
    return index
  }
  
  _getIndexAll(tag) {
    let index = []
    if (tag in this.props.table) {
      index = this.props.table[tag]
    } else if (tag.toLowerCase() in this.props.table) {
      index = this.props.table[tag.toLowerCase()]
    }
    return index
  }

  getSentiment(entity) {
    if (!entity) {
      return undefined
    }

    let comention = this.state.comention
    if (this.state.comentionHover !== undefined) {
      comention = this.state.comentionHover
    }

    let positives = []
    let negatives = []
    let _positives = []
    let _negatives = []
    this.props.bookmarks.forEach((bookmark, idx) => {
      let index = this._getIndex(entity, idx)
      index.map((start, idx) => { 
        if (idx !== 0 && start - index[idx-1] > WinSize) {
          return
        }
        let tokens = bookmark.fulltext.slice(Math.max(0, start - WinSize), start + WinSize)
        let sentiment = Sentimood.analyze(tokens.join(' '))
        positives = positives.concat(sentiment.positive.words)
        negatives = negatives.concat(sentiment.negative.words)
        if (comention !== undefined) {
          if(tokens.map((t) => t.toLowerCase()).indexOf(comention) >= 0) {
            _positives = _positives.concat(sentiment.positive.words)
            _negatives = _negatives.concat(sentiment.negative.words)
          }
        }
      })
    })
    positives = countBy(positives)
    positives = Object.keys(positives).map((token) => {
      let count = positives[token]
      return [token, count * AFINN[token]]
    })
    positives = sortBy(positives, (p) => -p[1])

    negatives = countBy(negatives)
    negatives = Object.keys(negatives).map((token) => {
      let count = negatives[token]
      return [token, count * AFINN[token]]
    })
    negatives = sortBy(negatives, (p) => p[1])

    let max = 0
    positives.forEach((token_score) => {
      let score = token_score[1]
      max = Math.max(Math.abs(score), max)
    })
    negatives.forEach((token_score) => {
      let score = token_score[1]
      max = Math.max(Math.abs(score), max)
    })

    if (comention !== undefined) {
      _positives = countBy(_positives)
      _positives = Object.keys(_positives).map((token) => {
        let count = _positives[token]
        return [token, count * AFINN[token]]
      })
      _positives = zipObject(_positives.map((p) => p[0]), _positives.map((p) => p[1]))
      positives = positives.map((p) => [p[0], get(_positives, p[0], 0)])

      _negatives = countBy(_negatives)
      _negatives = Object.keys(_negatives).map((token) => {
        let count = _negatives[token]
        return [token, count * AFINN[token]]
      })
      _negatives = zipObject(_negatives.map((p) => p[0]), _negatives.map((p) => p[1]))
      negatives = negatives.map((p) => [p[0], get(_negatives, p[0], 0)])
    }

    return [positives, negatives, max]
  }

  getDesc(idx, limit) {
    let bookmark = this.props.bookmarks[idx]
    if (this.props.focus === undefined) {
      return bookmark.desc
    }
    let index = this._getIndex(this.props.focus, idx)

    return (
      <span>
        { index.map((start, idx) => { 
          if (idx !== 0 && start - index[idx-1] > WinSize) {
            return
          }
          if (limit < 0) {
            return
          }
          limit = limit - 1
          return (
            <span style={{display: 'block', marginBottom: '8px'}} key={`mentions.${start}.${idx}`}>
              <span>...{bookmark.fulltext.slice(Math.max(0, start - WinSize), index[0]).join(' ')}</span>
              <span style={{color: 'red'}}> {bookmark.fulltext[start]} </span>
              <span>{bookmark.fulltext.slice(start - 1, start + WinSize).join(' ')}...</span>
            </span>
          )
      })}
      </span>
    )
  }

  render() {
    let index = undefined
    if (this.props.focus !== undefined) {
      index = this.props.table[this.props.focus.toLowerCase()]
    }


    let comentions = {
      name: '',
      score: 1,
      color: lightBlue['A100'],
      weight: 1,
      children: []
    }
    if (this.props.focus !== undefined) {
      comentions.children = this.getComentionCounts(this.props.focus)
        .filter((t) => t[1] >= 2)
        .slice(0, 9)
        .map((token_count) => {
        let token = token_count[0]
        let count = token_count[1]
        return {
          name: token,
          score: count,
          weight: count,
          highlight: token === this.state.comentionHover || (this.state.comentionHover === undefined && token === this.state.comention)
        }
      })
    }

    let sentimentMap = {};
    this.props.clusters[this.props.tab].tags.forEach(tag => {
      sentimentMap[tag] = this.getSentiment(tag);
    })
    
    let sentiment
    let max = 0
    if (this.props.focus !== undefined) {
      sentiment = sentimentMap[this.props.focus]
      max = sentiment[2]
      sentiment = sentiment.slice(0,2).map((s) => s.map((token_score) => {
        let token = token_score[0]
        let score = token_score[1]
        max = Math.max(Math.abs(score), max)
        return {x: token, y: Math.abs(score)}
      }))
    }

    let maxPolarity = 0;
    let minPolarity = Infinity;
    let totalSentimentMap = {}
    forEach(sentimentMap, (sentiment, tag) => {
      let positive = reduce(sentiment[0], (acc, val) => acc + Math.abs(val[1]), 0)
      let negative = reduce(sentiment[1], (acc, val) => acc + Math.abs(val[1]), 0)
      let mentions = reduce(this._getIndexAll(tag), (acc, doc) => acc + doc.length, 0) || 0
      let polarity = ((positive + negative) / mentions) || 0;
      
      maxPolarity = Math.max(maxPolarity, polarity)
      minPolarity = Math.min(minPolarity, polarity)
      totalSentimentMap[tag] = {positive, negative, mentions, polarity}
    }, 0)

    return (<React.Fragment><CssBaseline />
			<Grid container spacing={8} alignItems='flex-end' style={{padding: '12px 32px 24px 24px'}}>
				<Grid item>
					<Search/>
				</Grid>
				<Grid item xs={4}>
                  <SelectField value={this.props.dataKey} onChange={e => this.props.history.push(`/${e.target.value}`)}>
                    <MenuItem value="obama">
                      Obama family tree
                    </MenuItem>
                    <MenuItem value="barcelona">
                      Daytrips from Barcelona
                    </MenuItem>
                    <MenuItem value="er">
                      ER TV Show
                    </MenuItem>
                    <MenuItem value="angelina">
                      Angelina Jolie
                    </MenuItem>
                    <MenuItem value="harry">
                      Harry Potter
                    </MenuItem>
                    <MenuItem value="election">
                      2016 presidential election
                    </MenuItem>
                  </SelectField>
				</Grid>
			</Grid>

      
      <AppBar position="static" color="default">
				<Tabs
					value={this.props.tab}
					indicatorColor="secondary"
					textColor="primary"
					scrollable
					scrollButtons="auto"
				>
          {this.props.clusters.map((cluster, idx) => 
            <SimpleLink to={`/${this.props.dataKey}/${idx}`} key={`clusterTab.${idx}`}>
              <Tab label={
                cluster.name.replace(/^ *YAGO_yago/, '').replace(/^ *YAGO_[^_]+_/, '').replace(/ *\([^)]+\)/, '').replace(/_[0-9]*$/, '').replace(/_+/g, ' ').trim()
              }/>
            </SimpleLink>
          )}
        </Tabs>
      </AppBar>

      <FlipMove duration={700} easing="ease-in-out" leaveAnimation='none' style={{display: 'flex', overflowX: 'auto', background: grey[800], padding: '8px', margin: '0px', minWidth: '100%'}}>
				{ this.props.clusters[this.props.tab].tags.map((tag, idx) => {
          if ((this.props.focus === undefined || this.props.focus === tag ) && 
            this.props.table[tag] != undefined)
          return (
            <WikipediaCard
              entityName={tag}
              percentageBar = { Object.keys(this.props.table[tag]).length / this.props.bookmarks.length}
              selected={tag === this.props.focus}
              dataKey={this.props.dataKey}
              maxPolarity={maxPolarity}
              minPolarity={minPolarity}
              sentiment={totalSentimentMap[tag]}
              tab={this.props.tab}
              onCancel={() => this.setState({focus: undefined})}
              key={`cluster.${this.props.tab}.${idx}`}/>
          )
				})}
      </FlipMove>
      <div style={{display: (this.props.focus === undefined ? 'none' : 'block'), position: 'relative', top: '-371px', marginBottom: '-371px', left: '300px', width: 'calc(100vw - 300px)', overflow: 'hidden'}} key='entity_global_viz_container'>
        <FlipMove duration={350} easing="ease-in-out" leaveAnimation='none' enterAnimation='fade' style={{display: 'flex'}}>
          {this.props.focus !== undefined && (
            <div key='entity_comention_container'>
              <div style={{color: 'white', fontSize: '1.1em'}}>Related Terms</div>
              <TreeMap width={200} height={332} transitionDuration={0} customScale={false}
                labelColor={'black'} fontSize={14} scoreInLabel={false}
                falseinnerPadding={4} corner={2} stroke={false}
                style={{}}
                data={comentions} onItemHover={(event, d, hover) => {
                  if (hover === true)
                    this.setState({comentionHover: d.name})
                  else
                    this.setState({comentionHover: undefined})
                }}
                data={comentions} onItemClick={(event, d) => {
                  if (this.state.comention === d.name)
                    this.setState({comention: undefined})
                  else
                    this.setState({comention: d.name})
                }}/>
            </div>
          )}
          {this.props.focus !== undefined && (
            <div key='entity_sentiment_container' style={{marginLeft: '24px'}}>
              <div style={{color: 'white', fontSize: '1.1em'}}>Sentiment</div>
              <div>
                <BarChart width={45 * sentiment[0].length} height={160} color={green[200]}
                  max={max}
                  data={sentiment[0]} onClick={(event, d) => {}}/>
                <div style={{transform: 'scaleY(-1)'}}>
                  <BarChart width={45 * sentiment[1].length} height={160} color={red[200]}
                    mirrored={true}
                    max={max}
                    data={sentiment[1]} onClick={(event, d) => {}}/>
                </div>
              </div>
            </div>
          )}
        </FlipMove>
      </div>

      <div style={{display: 'flex'}}>
        <div style={{padding: '32px', maxWidth: '600px'}}>
          <Grid container spacing={24}>
            { this.props.focus !== undefined && (
              <Grid item xs={12}>
                <SnackbarContent
                  message={`Showing ${Object.keys(this.props.table[this.props.focus]).length} (${Math.round(100*Object.keys(this.props.table[this.props.focus]).length/this.props.bookmarks.length)}%) results that mentioned "${this.props.focus}"`}
                  action={(
                    <SimpleLink to={`/${this.props.dataKey}/${this.props.tab}`}>
                      <Button color="secondary" size="small">Show All</Button>
                    </SimpleLink>
                  )} />
              </Grid>
            )}
            <Grid item xs={12}>
              { this.props.bookmarks.map((bookmark, idx) => {
                if (index !== undefined && !(idx in index)) {
                  return
                }
                let desc = this.getDesc(idx, 3)
                if (desc === undefined) {
                  return
                }
                return (
                  <Card style={{padding: '4px', margin: '12px'}} key={`bookmark.${idx}`}>
                    <CardContent>
                      <Title url={bookmark.url}>{bookmark.title}</Title>
                      <Url url={bookmark.url}/>
                      <Typography component='p' style={{marginTop: '12px'}}>
                        { desc }
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
