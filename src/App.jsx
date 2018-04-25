import React, { Component } from 'react'

import styled from 'styled-components'

import CssBaseline from 'material-ui/CssBaseline'
import Grid from 'material-ui/Grid'
import Card, { CardContent, CardActions, CardMedia } from 'material-ui/Card'
import Typography from 'material-ui/Typography'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

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

	handleExploreEntity(tag) {
    console.log(tag)
	}

  render() {
    return (<React.Fragment><CssBaseline />
			<Grid container spacing={8} alignItems='flex-end' style={{padding: '12px 32px 0px 24px'}}>
				<Grid item>
					<Search/>
				</Grid>
				<Grid item xs={4}>
					<TextField id='input-with-icon-grid' label='Search the Web' value='Day trips from Barcelona' style={{width: '100%'}} disabled/>
				</Grid>
			</Grid>

      <div style={{display: 'flex', overflowX: 'auto', background: grey[800], padding: '32px', margin: '32px 0px'}}>
				{ this.props.clusters[0].tags.map((tag, idx) => {
          return (
            <WikipediaCard entityName={tag} onExploreEntity={this.handleExploreEntity.bind(this, tag)} key={`cluster.0.tag.${idx}`}/>
          )
				})}
      </div>

      <div style={{display: 'flex'}}>

        <div style={{padding: '32px', maxWidth: '600px'}}>
          <Grid container spacing={24}>
            <Grid item xs={12}>
              { this.props.bookmarks.map((bookmark, idx) => {
                return (
                  <Card style={{padding: '4px', margin: '12px'}} key={`bookmark.${idx}`}>
                    <CardContent>
                      <Title url={bookmark.url}>{bookmark.title}</Title>
                      <Url url={bookmark.url}/>
                      <Typography component='p' style={{marginTop: '12px'}}>
                        { bookmark.desc }
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

export default App;
