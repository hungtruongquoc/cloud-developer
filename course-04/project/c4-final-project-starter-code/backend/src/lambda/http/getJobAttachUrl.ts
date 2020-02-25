import 'source-map-support/register'
import {APIGatewayProxyResult, APIGatewayProxyHandler} from 'aws-lambda'
import {createLogger} from '../../utils/logger'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'
import * as AWSXRay from 'aws-xray-sdk'
import * as AWS  from 'aws-sdk'
import {getUserId} from "../../utils/jwtToken";

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({signatureVersion: 'v4'})
const docClient = new XAWS.DynamoDB.DocumentClient()

const logger = createLogger('job-attachment-url')
const bucketName = process.env.JOBS_S3_BUCKET
const jobTable = process.env.JOBS_TABLE

export const handler: APIGatewayProxyHandler = middy(async (event): Promise<APIGatewayProxyResult> => {
	logger.info('In get job attachment URL: ')
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)

	if (user) {
		const jobId = event.pathParameters.jobId
		const isValidJob = await jobExists(jobId, user);

		if (isValidJob) {
			const url = getUploadUrl(jobId);
			logger.info(`${user} requested upload URL ${url}`)
			return {
				statusCode: 200,
				body: JSON.stringify({url})
			}
		}

		return {
			statusCode: 404,
			body: JSON.stringify({
				error: 'Provided job does not exist'
			})
		}
	}
	return {
		statusCode: 401,
		body: JSON.stringify({
			error: 'Unauthorized access'
		})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}));

async function jobExists(jobId: string, userId: string) {
	const result = await docClient
			.get({
				TableName: jobTable,
				Key: {jobId, userId}
			})
			.promise()

	logger.info('Check job exists: ', result)
	return !!result.Item
}

function getUploadUrl(jobId: string) {
	return s3.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: jobId,
		Expires: 30000
	})
}
