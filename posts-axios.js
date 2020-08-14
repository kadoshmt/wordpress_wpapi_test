const fs = require('fs');
const axios = require('axios'); 
const getSortOrder = require('./getSortOrder.js');

/** VARIABLES */
// The website have 640 posts
const totalPages = 7; 
const filename = './wp-posts.json';
const promises = [];
let posts = [];
let postsList = [];

// Open file and get data if exists
if (fs.existsSync(filename)) { 
  posts = require(filename);
  postsList = posts.map(ele => ele.title);  
}

// Async function to get the posts from Wordpress
const getPosts = async (page) => {    
  try {
    const response = await axios.get(
      `https://harpacrista.org/wp-json/wp/v2/posts?page=${page}&per_page=100`
    )    

    const result = response.data.map(post => {
      const {
        id:number,
        title:{rendered: title},
        content:{rendered : body},
        slug 
      } = post;    

      let temp = '';
      let content = '';
  
      console.log(number, title);

      // Hymn 637 have a youtube video object. So, let's remove it!
      if (number === 637) {
        console.log(`Hino ${number} - ${title} com audio vídeo do youtube`);
        temp = body.split("</object><br />");
        // get the body of the hymns
        content = temp[1];     
      }
      // some hymns have the audio tag inside the fist <p>
      // In this cases, only remove the the first <p>
      else if(body.search("</audio></p>") === -1){
        // remove 1st audio tag
        temp = body.split("</audio><br />");    

        // check if exists 2nd or 3rd audio tags, if then, remove this 
        if(temp.length === 3) {        
          temp = '<p>'.concat(temp[1]).concat(temp[2]);
          temp = temp.split("</a>");
          temp = '<p>'.concat(temp[1]);
        // some hymns, like hymn 227 have 3 audio tags 
        // (https://harpacrista.org/hino/227-deus-amou-de-tal-maneira/)
        } else {
          temp = '<p>'.concat(temp[temp.length - 1]) 
        }      
        
        temp = temp.split("<p>Autor");  
      
        // get the body of the hymns
        content = temp[0];

      } else {
        console.log(`Hino ${number} - ${title} com audio dentro da tag <p>`);
        temp = body.split("</audio></p>");     
        // get the body of the hymns
        content = temp[1];      
      }        

      // get the authors info
      temp = '<p>Autor'.concat(temp[1]);    
      temp = temp.split("tor:");   
      temp = temp[1].trim().split("<br />");
      const author = temp[0].trim();

      return { number, title, slug, author, content };
    })

    // Verify if the title already exists in array. If not, save the post 
    result.forEach(element => {
      if(!postsList.includes(element.title)){
        postsList.push(element.title);
        posts.push(element);
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
  posts.sort(getSortOrder("number"));  
  // and save data on file in server
  fs.writeFile(filename, JSON.stringify(posts, null, 2), err => {
    if(err) throw new Error ('something went wrong');
    console.log('Well Done!');
  });
}, 10000);
