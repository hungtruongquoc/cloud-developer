import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {getSecretValue} from "../utils";
import * as middy from 'middy'
import {cors} from "middy/middlewares";

const logger = createLogger('get_upload_url')

let uploadSecret: string = null
let uploadAccess: string = null

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const currentUploadSecret = await getUploadSecret()
	const currentUploadAccess = await getUploadAccess()
	const s3 = new AWS.S3({
		secretAccessKey: currentUploadSecret,
		accessKeyId: currentUploadAccess
	})
  const params = {Bucket: 'serverless-todo-app-asset', ContentType: 'image/jpeg', Key: `${todoId}.jpeg`};
	const uploadUrl = s3.getSignedUrl('putObject', params)
	// TODO: Return a presigned URL to upload a file for a TODO item with the provided id
	logger.info('Result: ', {todoId, uploadUrl})
	return {
		statusCode: 200,
		body: JSON.stringify({uploadUrl})
	}
})

// @ts-ignore
handler.use(cors({credentials: true}))

async function getUploadSecret() {
	if (uploadSecret) return uploadSecret

	logger.info('Environment variables: ', process.env)
	uploadSecret =  await getSecretValue(process.env.UPLOAD_SECRET_ID, process.env.UPLOAD_SECRET_FIELD)
	logger.info('Upload secret', {uploadSecret})

	return uploadSecret
}

async function getUploadAccess() {
	if (uploadAccess) return uploadAccess

	logger.info('Environment variables: ', process.env)
	uploadAccess = await getSecretValue(process.env.UPLOAD_ACCESS_ID, process.env.UPLOAD_ACCESS_FIELD)
	logger.info('Upload access', {uploadAccess})

	return uploadAccess
}
