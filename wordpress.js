const fs = require('fs');
const WPAPI = require( 'wpapi' );

const wp = new WPAPI({ endpoint: 'http://harpacrista.org/wp-json' });


let posts = []


// Promises
wp.posts()
.param( 'page', 7 )
.perPage(100)
.then(function( data ) {
  
  posts = data.map(post => {
    const {
      id:number,
      title:{rendered: title},
      content:{rendered : body},
      slug 
    } = post;

    

    // generate a temporary div elementt
    let temp = body.split("</audio><br />");
    temp = '<p>'.concat(temp[1])    

    // get the authors info
    temp = temp.split("<p>Autor");
    
    // get back the updated html content from dom element
    const content = temp[0];
    const author = '<p>Autor'.concat(temp[1]);
    

    return { number, title, slug, author, content };
    
  })
  
  fs.writeFile('wp-page-07.json', JSON.stringify(posts, null, 2), err => {
    if(err) throw new Error ('something went wrong')
    console.log('Well Done!')
  });

  // console.log(posts);


}).catch(function( err ) {
  console.log(err);
});


