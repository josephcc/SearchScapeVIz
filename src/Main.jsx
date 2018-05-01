import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App"
import NoMatch from './NoMatch'

import barcelona from './data/barcelona.json'
import angelina from './data/angelina_jolie.json'
import obama from './data/obama.json'
import er from './data/er.json'

const data = {barcelona, angelina, obama, er}
const queries = {
  barcelona: "Day trips from Barcelona",
  angelina: "Angelina Jolie",
  obama: "Barack Obama family tree",
  er: "tv show ER"
}
export default class Main extends React.Component {
  
  render() {
    return <Router>
      <Switch>
        <Route path={`/:data(${Object.keys(data).join("|")})/:tab?/:tag?`} render={props => {
          let focus = props.match.params.tag
          let tab = props.match.params.tab || 0     
          let dataSet = props.match.params.data
          
          return <App {...data[dataSet]} {...props} focus={focus} tab={tab} dataKey={props.match.params.data} query={queries[dataSet]}/>
        }}/>
        <Route component={NoMatch} />
      </Switch>
    </Router>
  }
  
}
