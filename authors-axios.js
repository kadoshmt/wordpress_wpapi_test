const fs = require('fs');
const axios = require('axios'); 
const getSortOrder = require('./getSortOrder.js');

/** VARIABLES */
// The website have 640 posts
const totalPages = 7; 
const filename = './wp-authors.json';
const promises = [];
let authors = [];
let authorsList = [];
let author_id = 0;


// Open file and get data if exists
if (fs.existsSync(filename)) { 
  authors = require(filename);
  authorsList = authors.map(ele => ele.author);
  // get the last id used in file
  author_id = authors[authors.length -1].id;
}

// Async function to get the posts from Wordpress
const getPosts = async (page) => {    
  try {
    const response = await axios.get(
      `https://harpacrista.org/wp-json/wp/v2/posts?page=${page}&per_page=100`
    )    

    const result = response.data.map(post => {
      const {
        content:{rendered : body},
      } = post;    

      // get the author's name
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
  } catch (error) {
    console.log(page, 'error');
  }
}

// put the async calls for the function in a stack of promisses
for(i = 1; i <= totalPages; i++){    
  promises.push(getPosts(i));
}

// Run all the promisses
const runFunc = async () => {await Promise.all(promises)};
runFunc();

// Wait some time to finish the promisses... 
setTimeout(()=>{   
  // console.log(authors)
  authors.sort(getSortOrder("author"));
  // and save data on file in server
  fs.writeFile(filename, JSON.stringify(authors, null, 2), err => {
    if(err) throw new Error ('something went wrong');
    console.log('Well Done!');
  });
}, 8000);
