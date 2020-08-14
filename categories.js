const fs = require('fs');
const WPAPI = require( 'wpapi' );
const axios = require('axios');

const wp = new WPAPI({ endpoint: 'http://harpacrista.org/wp-json' });


let posts = []
let hymns = [];
const categoriesPerPage = 60


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
  // remove categorias vazias
  posts = posts.filter(post => post.count > 0);
  // remove categoria "sem categoria"
  posts.shift();
  
  // console.log(posts);

  const yourAsyncFunction = async (category) => {    
    try {
      const response = await axios.get(
        `https://harpacrista.org/wp-json/wp/v2/posts?categories=${category.id}`
      )

      // console.log(response.data);

      const ids = response.data.map(hymn => hymn.id)      

      const newData = {...category, numbers: ids}
      
      hymns.push(newData)
    } catch (error) {
      console.log(categoryId, 'error');
    }
  }

  const promises = []
  
  for(i = 0; i < posts.length; i++){
    
    promises.push(yourAsyncFunction(posts[i]))
  }
  const runFunc = async () => {await Promise.all(promises)};
  runFunc();
  setTimeout(()=>{   
    // console.log(hymns)
    fs.writeFile('wp-categories.json', JSON.stringify(hymns, null, 2), err => {
      if(err) throw new Error ('something went wrong')
      console.log('Well Done!')
    });
  }, 500 * categoriesPerPage)
  

}).catch(function( err ) {
  console.log(err);
});



// function getPosts(category){
//   Promise.resolve(wp.posts()
//     .categories( category.id )
//     .perPage(100)
//     .then(function( response ) {       
//       response.map(res => {
//       hymns[category.id].push(res.id)
//       })        
//     }).catch(function( err ) {
//       console.log(err);
//     }))
// }




// posts.map( post => {
//   promises.push(getPosts(post.id) );
// })

// Promise.all(promises)
//   .then(() => {    
//     posts.map(post => {
//       console.log('entrou');
//       console.log(hymns[post.id]);      
//     }) 
    
//   })
//   .catch((e) => {
//       // handle errors here
//   });

  



// fs.writeFile('wp-categories.json', JSON.stringify(posts, null, 2), err => {
//   if(err) throw new Error ('something went wrong')
//   console.log('Well Done!')
// });


