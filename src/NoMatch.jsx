import React from 'react'
import {Link} from 'react-router-dom'

const NoMatch = ({ location }) => (
  <div>
    <h3>No match for <code>{location.pathname}</code></h3>
    <h3>Pick a data set to work from!</h3>
    <ul>
      <li><Link to="/obama">Barack Obama family tree</Link></li>
      <li><Link to="/barcelona">Day trips from Barcelona</Link></li>
      <li><Link to="/er">tv show ER</Link></li>
      <li><Link to="/angelina">Angelina Jolie</Link></li>
    </ul>
  </div>
)

export default NoMatch