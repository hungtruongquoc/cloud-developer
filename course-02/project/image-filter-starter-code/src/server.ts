import express from 'express';
import bodyParser from 'body-parser';
var validator = require('validator');
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  
  app.get('/filteredimage', async(req, res) => {

    const imageUrl = req.query.image_url;

    if (imageUrl) {
      if (validator.isURL(imageUrl)) {
        try {
          console.log('Found image URL: ', imageUrl);
          const outputFilePath = await filterImageFromURL(imageUrl);
          res.status(200).sendFile(outputFilePath, (err) => {
            if (!err) {
              console.log('Delete file: ', outputFilePath);
              deleteLocalFiles([outputFilePath]);
            }
          });
        }
        catch(error) {
          res.status(500).send('Failed to apply filters on this image.');
        }
      }
      else {
        res.status(401).send('Invalid URL.');
      }
    }
    else {
      res.status(401).send('No image URL found.');
    }
  });
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();
