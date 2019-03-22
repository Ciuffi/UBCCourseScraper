/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';

import Scraper from './Scraper.js'


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const Scrape = functions.https.onRequest((request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    Scraper.mine(request.query.size).then(() =>{
        response.send(200);
    }).catch((error) => console.log(`yikes ${error}`));
});
