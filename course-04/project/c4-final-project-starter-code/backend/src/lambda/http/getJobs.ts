import 'source-map-support/register'

import {APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'

import {createLogger} from '../../utils/logger'

import * as middy from 'middy'

import {cors} from 'middy/middlewares'
import {getAllJobs} from "../../businessLogic/jobs";
import {getUserId} from "../../utils/jwtToken";

const logger = createLogger('job-get')

export const handler: APIGatewayProxyHandler = middy(async (event): Promise<APIGatewayProxyResult> => {
	// TODO: Get all TODO items for a current user
	logger.info('In get API: ')
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)

	let nextKey // Next key to continue scan operation if necessary
	let limit // Maximum number of elements to return

	try {
		// Parse query parameters
		nextKey = parseNextKeyParameter(event)
		limit = parseLimitParameter(event) || 20
	} catch (e) {
		console.log('Failed to parse query parameters: ', e.message)
		return {
			statusCode: 400,
			body: JSON.stringify({
				error: 'Invalid parameters'
			})
		}
	}

	const result = await getAllJobs(user, nextKey, limit);

	return {
		statusCode: 200,
		body: JSON.stringify({...result})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}));

/**
 * Get value of the limit parameter.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {number} parsed "limit" parameter
 */
function parseLimitParameter(event) {
	const limitStr = getQueryParameter(event, 'limit')
	if (!limitStr) {
		return undefined
	}

	const limit = parseInt(limitStr, 10)
	if (limit <= 0) {
		throw new Error('Limit should be positive')
	}

	return limit
}

/**
 * Get value of the limit parameter.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {Object} parsed "nextKey" parameter
 */
function parseNextKeyParameter(event) {
	const nextKeyStr = getQueryParameter(event, 'nextKey')
	if (!nextKeyStr) {
		return undefined
	}

	const uriDecoded = decodeURIComponent(nextKeyStr)
	return JSON.parse(uriDecoded)
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
	const queryParams = event.queryStringParameters
	if (!queryParams) {
		return undefined
	}

	return queryParams[name]
}
