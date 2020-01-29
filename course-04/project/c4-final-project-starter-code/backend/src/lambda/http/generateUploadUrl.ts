import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import {APIGatewayProxyResult, APIGatewayProxyHandler, APIGatewayProxyEvent} from 'aws-lambda'
import {createLogger} from "../../utils/logger";
import {getSecretValue} from "../utils";
import * as middy from 'middy'
import {cors} from "middy/middlewares";
import {Credentials} from "aws-sdk";
import {getUserId} from "../../utils/jwtToken";
import {getOneToDoItem, updateToDo} from "../../businessLogic/todo";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";

const logger = createLogger('get_upload_url')

let uploadSecret: string = null
let uploadAccess: string = null

export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	const todoId = event.pathParameters.todoId
	const currentUploadSecret = await getUploadSecret()
	const currentUploadAccess = await getUploadAccess()
	const authorization = event.headers.Authorization
	const split = authorization.split(' ')
	const jwtToken = split[1]
	const user = getUserId(jwtToken)
	const s3 = new AWS.S3({
		credentials: new Credentials(currentUploadAccess, currentUploadSecret),
		signatureVersion: 'v4'
	})
  const params = {Bucket: 'serverless-todo-app-asset', Key: `assets/${todoId}.jpeg`};
	const uploadUrl = s3.getSignedUrl('putObject', params)
	const result = await getOneToDoItem(user, todoId)
	if (result) {
		logger.info('Result: ', {todoId, uploadUrl, result})
		// @ts-ignore
		const {name, dueDate, done} = result;
		const attachmentUrl = `https://serverless-todo-app-asset.s3.amazonaws.com/assets/${todoId}.jpeg`;
		const newData: UpdateTodoRequest = {name, dueDate, done, attachmentUrl};
		await updateToDo(user, todoId, newData);
		return {
			statusCode: 200,
			body: JSON.stringify({uploadUrl})
		}
	}
	return {
		statusCode: 500,
		body: JSON.stringify({message: 'ToDo item not found'})
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
