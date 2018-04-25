import React, { Component } from 'react'

import styled from "styled-components"

import CssBaseline from 'material-ui/CssBaseline'
import Grid from 'material-ui/Grid'
import Card, { CardContent } from 'material-ui/Card'
import Typography from 'material-ui/Typography'

import blue from 'material-ui/colors/blue'
import green from 'material-ui/colors/green'


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
  render() {
    return (<React.Fragment><CssBaseline />

      <div style={{padding: '32px', width: '600px'}}>
        <Grid container spacing={24}>
          <Grid item xs={12}>
            { this.props.bookmarks.map((bookmark) => {
              return (
								<Card style={{padding: '4px', margin: '12px'}}>
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

    </React.Fragment>);
  }
}

export default App;
