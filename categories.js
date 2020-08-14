const fs = require('fs');
const WPAPI = require( 'wpapi' );
const axios = require('axios'); 
const wp = new WPAPI({ endpoint: 'http://harpacrista.org/wp-json' });
const getSortOrder = require('./getSortOrder.js');

const filename = './wp-categories.json';
let posts = [];
let hymns = [];
const promises = [];
const categoriesPerPage = 60;


// Promises
wp.categories()
.param( 'page', 1 )
.perPage(categoriesPerPage)
.then(function( data ) {
  posts = data.map(post => {
    const {
      id,
      count,
      name,
      slug,
     //  _links:{collection:[{href:url}]}
    } = post;   

    return { id, count, name, slug };    
  })
  // remove empty categories
  posts = posts.filter(post => post.count > 0);
  // remove category "sem categoria"
  posts.shift();
  
  // console.log(posts);

  const yourAsyncFunction = async (category) => {    
    try {
      const response = await axios.get(
        `https://harpacrista.org/wp-json/wp/v2/posts?categories=${category.id}&per_page=100`
      );

      // console.log(response.data);

      const ids = response.data.map(hymn => hymn.id);  

      const newData = { ...category, numbers: ids };
      
      hymns.push(newData);
    } catch (error) {
      console.log(categoryId, 'error');
    }
  }
  
  for(i = 0; i < posts.length; i++){
    
    promises.push(yourAsyncFunction(posts[i]));
  }
  const runFunc = async () => {await Promise.all(promises)};
  runFunc();

  setTimeout(()=>{   
    // console.log(hymns)
    hymns.sort(getSortOrder("name"));  
    fs.writeFile(filename, JSON.stringify(hymns, null, 2), err => {
      if(err) throw new Error ('something went wrong');
      console.log('Well Done!');
    });
  }, 200 * categoriesPerPage);
  

}).catch(function( err ) {
  console.log(err);
});
