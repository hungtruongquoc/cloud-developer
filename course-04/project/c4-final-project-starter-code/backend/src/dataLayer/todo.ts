import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {createLogger} from "../utils/logger";
import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('todo-data-layer')

function createDynamoDBClient() {
	if (process.env.IS_OFFLINE) {
		console.log('Creating a local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}

export class Todo {
	constructor(
			private readonly docClient: DocumentClient = createDynamoDBClient(),
			private readonly todoTable = process.env.TODOS_TABLE) {
	}

	async getToDo(user: string, todoId: string): Promise<AWS.DynamoDB.QueryOutput> {
		logger.info('Get one todo: ', {user, todoId});

		const scanParams = {
			TableName: this.todoTable,
			KeyConditionExpression: "userId = :id And todoId = :todo",
			ExpressionAttributeValues: {
				":id": user,
				":todo": todoId
			}
		}
		return await this.docClient.query(scanParams).promise()
	}

	async getAllToDos(user: string, nextKey, limit): Promise<AWS.DynamoDB.QueryOutput> {

		logger.info('In get Database Layer: ')

		// Scan operation parameters
		const scanParams = {
			TableName: this.todoTable,
			Limit: limit,
			ExclusiveStartKey: nextKey,
			KeyConditionExpression: "userId = :id",
			ExpressionAttributeValues: {
				":id": user
			}
		}

		return await this.docClient.query(scanParams).promise()
	}

	async createToDo(item): Promise<TodoItem> {
		await this.docClient.put({TableName: this.todoTable, Item: item}).promise()
		return item
	}

	async  deleteToDo(user, todoId: string): Promise<string> {
		await this.docClient.delete({TableName: this.todoTable, Key: {userId: user, todoId}}).promise()
		return todoId;
	}

	async updateToDo(user: string, todoId: string, newData: UpdateTodoRequest): Promise<Object> {
		// Builds the expressions for update
		let updateExpression = 'set #name = :n, dueDate = :d, done = :c';
		let attributeValues = {
			':n': newData.name,
			':d': newData.dueDate,
			':c': newData.done
		}

		if (newData.attachmentUrl) {
			updateExpression += ', attachmentUrl = :url'
			attributeValues[':url'] = newData.attachmentUrl
		}
		const updatedItem = await this.docClient.update({
			TableName: this.todoTable,
			Key: {userId: user, todoId},
			UpdateExpression: updateExpression,
			ExpressionAttributeValues: attributeValues,
			ExpressionAttributeNames: {
				'#name': 'name'
			}
		}).promise()
		logger.info('update result: ', {...updatedItem})
		return {todoId, ...newData}
	}
}
