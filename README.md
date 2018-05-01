SearchScape allows you to explore the distribution and sentiment of different entities (i.e. people, places, etc.) from a set of search results. This was built for CMU's Data Visualization class with Adam Perer. 

## Demo Version

You can find a deployed version of the project [here](http://joseph.nlpweb.org/SearchScapeVIz). With this, you can explore 6 different searches that we've pre-compiled with the visualization interface:

- [Day trips from Barcelona](http://joseph.nlpweb.org/SearchScapeVIz/barcelona)
- [Angelina Jolie](http://joseph.nlpweb.org/SearchScapeVIz/angelina)
- [Barack Obama family tree](http://joseph.nlpweb.org/SearchScapeVIz/obama)
- [tv show ER](http://joseph.nlpweb.org/SearchScapeVIz/er)
- [harry potter](http://joseph.nlpweb.org/SearchScapeVIz/harry)
- [2016 presidential election](http://joseph.nlpweb.org/SearchScapeVIz/election)

## Repository Contents

This application was built using [React](reactjs.org) and [D3](d3js.org). React provides interactivity support, while D3 serves as the main way we perform visualization -- specifically the sentiment, frequency and co-occurrence diagrams.

#### Process Slides

The process slides can be found in the root of the repository [process.pdf](process.pdf)

#### Video

The video giving a brief overview of how SearchScape works can be found [here](video.mp4)

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