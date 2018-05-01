import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App"
import NoMatch from './NoMatch'

import barcelona from './barcelona.json'
import angelina from './angelina_jolie.json'
import obama from './obama.json'
import er from './er.json'

const data = {barcelona, angelina, obama, er}
export default class Main extends React.Component {
  
  render() {
    return <Router>
      <Switch>
        <Route path={`/:data(${Object.keys(data).join("|")})/:tab?/:tag?`} render={props => {
          let focus = props.match.params.tag
          let tab = props.match.params.tab || 0                                                                        
          return <App {...data[props.match.params.data]} {...props} focus={focus} tab={tab} dataKey={props.match.params.data}/>
        }}/>
        <Route component={NoMatch} />
      </Switch>
    </Router>
  }
  
}