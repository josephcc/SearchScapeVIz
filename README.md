SearchScape allows you to explore the distribution and sentiment of different entities (i.e. people, places, etc.) from a set of search results. This was built for CMU's Data Visualization class with Adam Perer. 

## Repository Contents

This application was built using [React](reactjs.org) and [D3](d3js.org). React provides interactivity support, while D3 serves as the main way we perform visualization -- specifically the sentiment, frequency and co-occurrence diagrams.

#### Repo Structure

All code and data in the `/src` directory are our own work, while any linked libraries can be found in the `package.json` file. The main entry point into the application is the `src/index.js` file, and the 4 different datasets we generated and use are found in the `src/data` directory. 

#### Running Locally

You can run the application locally with just a few commands. First, ensure you have [Node.js](nodejs.org) installed on your machine. Then, from in the repository directory:

1. Install react-scripts --
`npm install -g react-scripts`

2. Install the app dependencies --
`npm install`

3. Run the application -- 
`npm start`