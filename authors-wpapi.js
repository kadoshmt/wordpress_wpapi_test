const fs = require('fs');
const WPAPI = require( 'wpapi' );
const wp = new WPAPI({ endpoint: 'http://harpacrista.org/wp-json' });
const getSortOrder = require('./getSortOrder.js');

/** VARIABLES */
const filename = './wp-authors.json';
let authors = [];
let authorsList = [];
let author_id = 0;
const page = 1;

// Open file and get data if exists
if (fs.existsSync(filename)) { 
  authors = require(filename);
  authorsList = authors.map(ele => ele.author);
  // get the last id used in file
  author_id = authors[authors.length -1].id;
}

// Async function to get the posts from Wordpress
wp.posts()
.page(page)
.perPage(100)
.then(function( data ) {  
  const result = data.map(post => {
    const {
      content:{rendered : body},
    } = post;
    
    // get the authors name
    let temp = body.split("tor:");   
    temp = temp[1].trim().split("<br />");
    const authorTemp = temp[0].trim();

    // get the author initials
    temp = authorTemp.split(" ");
    const initials = temp.length > 1 ? temp[0] : '';
    const author = authorTemp.replace(initials, "").trim();

    // return author (the author id will be changed after)
    return { id: 0, author, initials };    
  })

  // Verify if the author already exists in array...
  result.forEach(element => {
     // if not, save the author
    if(!authorsList.includes(element.author)){
      authorsList.push(element.author);
      // change to the next id (remenber?)
      author_id++;
      authors.push({...element, id: author_id});
    }    
  });

  console.log(authors)
  // Save data on file in server
  authors.sort(getSortOrder("author"));
  fs.writeFile(filename, JSON.stringify(authors, null, 2), err => {
    if(err) throw new Error ('something went wrong');
    console.log('Well Done!');
  });

}).catch(function( err ) {
  console.log(err);
});


