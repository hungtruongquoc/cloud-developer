import {CustomAuthorizerEvent, CustomAuthorizerResult} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import {verify, decode} from 'jsonwebtoken'
import {createLogger} from '../../utils/logger'
import * as jwksRSA from 'jwks-rsa';
import {promisify} from "util";
// import Axios from 'axios'
import {Jwt} from '../../auth/Jwt'
import {JwtPayload} from '../../auth/JwtPayload'

const logger = createLogger('auth')
const secretClient = new AWS.SecretsManager()
let audience: string = null

// const secretId = process.env.AUTH_0_SECRET_ID
// const secretField = process.env.AUTH_0_SECRET_FIELD

// const client = new AWS.SecretsManager()

// Cache secret if a Lambda instance is reused
// let cachedSecret: string

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// Video example: https://davidwells.io/talks/portland-react-meetup
// Web resource: https://blog.danillouz.dev/serverless-auth/#implementing-the-lambda-authorizer
// Documentation page: https://serverless.com/examples/aws-node-auth0-cognito-custom-authorizers-api/
// https://auth0.com/docs/integrations/aws-api-gateway/custom-authorizers/part-4
// Github: https://github.com/serverless/examples/blob/master/aws-node-auth0-cognito-custom-authorizers-api/auth.js
// Another example: https://github.com/serverless/examples/blob/master/aws-node-auth0-custom-authorizers-api/handler.js
// Another one: https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer
// Another one: https://blog.danillouz.dev/serverless-auth/#2-configuring-a-serverless-manifest

const issuer = process.env.AUTH_URL
const jwksUrl = `${issuer}.well-known/jwks.json`

const jwksClient = jwksRSA({
	cache: true,
	rateLimit: true,
	jwksUri: jwksUrl
})

const getSigningKey = promisify(jwksClient.getSigningKey)
const verifyJwt = promisify(verify)

export const handler = async (
		event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
	logger.info('Authorizing a user', event.authorizationToken)
	try {
		const currentAudience = await getAudience();
		logger.info('Audience: ', [currentAudience])
		const jwtToken = await verifyToken(event.authorizationToken, verifyJwt, issuer, currentAudience.Audience)
		logger.info('User was authorized', jwtToken)

		return {
			principalId: jwtToken.sub,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Allow',
						Resource: '*'
					}
				]
			}
		}
	} catch (e) {
		logger.error('User not authorized', {error: e.message})

		return {
			principalId: 'user',
			policyDocument: {
				Version: '2012-10-17',
				Statement: [
					{
						Action: 'execute-api:Invoke',
						Effect: 'Deny',
						Resource: '*'
					}
				]
			}
		}
	}
}

async function verifyToken(authHeader: string, verifyJwt, issuer, audience): Promise<JwtPayload> {
	const token = getToken(authHeader)
	logger.info('Token from event', [token])
	// Retrieve the JWKS and filter for potential signing keys.
	// Extract the JWT from the request's authorization header.
	// Decode the JWT and grab the kid property from the header.
	const jwt: Jwt = decode(token, {complete: true}) as Jwt
	logger.info('jwt: ', [jwt])
	if (!jwt || !jwt.header || !jwt.header.kid) {
		throw new Error('Invalid JWT token')
	}
	// Find the signing key in the filtered JWKS with a matching kid property.
	// @ts-ignore
	const {publicKey, rsaPublicKey} = await getSigningKey(jwt.header.kid)
	logger.info('key: ', [publicKey, rsaPublicKey])
	const signingKey = publicKey || rsaPublicKey
	// Using the x5c property build a certificate which will be used to verify the JWT signature.
	// Ensure the JWT contains the expected audience, issuer, expiration, etc.

	// TODO: Implement token verification
	// You should implement it similarly to how it was implemented for the exercise for the lesson 5
	// You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
	return verifyJwt(token, signingKey, {issuer, audience})
}

function getToken(authHeader: string): string {
	if (!authHeader) throw new Error('No authentication header')

	if (!authHeader.toLowerCase().startsWith('bearer '))
		throw new Error('Invalid authentication header')

	const split = authHeader.split(' ')
	const token = split[1]
	logger.info('Token in get function: ', split)
	return token
}

async  function getAudience() {
	if (audience) return audience
	logger.info('SecretId: ', process.env)
	const data = await secretClient.getSecretValue(
			{SecretId: process.env.AUDIENCE_SECRET_ID}
	).promise()

	audience = JSON.parse(data.SecretString)

	return audience[process.env.AUDIENCE_FIELD]
}
