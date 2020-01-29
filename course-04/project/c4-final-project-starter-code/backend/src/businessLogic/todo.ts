import {Todo} from "../dataLayer/todo";
import {createLogger} from "../utils/logger";
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import {TodoItem} from "../models/TodoItem";
import {UpdateTodoRequest} from "../requests/UpdateTodoRequest";

const logger = createLogger('todo-get')
const dbTodo = new Todo()

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
	if (!lastEvaluatedKey) {
		return null
	}

	return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}

export async function getAllTodoItems(user: string, next, limit): Promise<Object> {
	logger.info('In business logic: ')
	const result = await dbTodo.getAllToDos(user, next, limit)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}

export async function getOneToDoItem(user: string, todoId: string): Promise<Object> {
	const result = await dbTodo.getToDo(user, todoId);
	if (result.Items && result.Items.length > 0) {
		return result.Items[0];
	}
	return null;
}

export async function createToDo(
		createToDoRequest: CreateTodoRequest,
		user: string
): Promise<TodoItem> {
	logger.info('In business logic of create: ', {createToDoRequest, user})
	//@ts-ignore
	const item: TodoItem = {...createToDoRequest, attachmentUrl: ' '};
	item.todoId = uuid.v4();
	item.userId = user;
	item.createdAt = (new Date()).toUTCString();
	item.done = false;
	return await dbTodo.createToDo(item);
}

export async function deleteToDo(user, todoId: string): Promise<string> {
	return await dbTodo.deleteToDo(user, todoId);
}

export async function updateToDo(user: string, todoId: string, newData: UpdateTodoRequest): Promise<Object> {
	return await dbTodo.updateToDo(user, todoId, newData);
}
