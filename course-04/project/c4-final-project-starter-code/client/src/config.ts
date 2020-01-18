// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '1vd7qlbil5'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-gfdym553.auth0.com',            // Auth0 domain
  clientId: 'lWwZ0BSlXRDQ23uaf4kFCfi2uK7O2wCC',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
