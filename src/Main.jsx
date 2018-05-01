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
        <Route path={`/:data(${Object.keys(data).join("|")})`} render={parProps => 
          <Router>
            <Switch>
              <Route path={`${parProps.match.path}/tag/:tag`} 
                render={props => <App {...data[parProps.match.params.data]} focus={props.match.params.tag} {...parProps}/>} />
              <Route render={props => <App {...data[parProps.match.params.data]} {...parProps}/>} />
            </Switch>
          </Router>                                                      
        }/>
        <Route component={NoMatch} />
      </Switch>
    </Router>
  }
  
}
