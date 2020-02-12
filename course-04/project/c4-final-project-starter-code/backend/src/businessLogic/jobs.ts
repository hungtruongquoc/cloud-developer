import {createLogger} from "../utils/logger";
import {Jobs} from "../dataLayer/jobs";

const logger = createLogger('job-get')
const dbJobs = new Jobs()

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

export async function getAllJobs(user: string, next, limit): Promise<Object> {
	logger.info('In jobs business logic: ')
	const result = await dbJobs.getAllJobs(user, next, limit)
	return {
		items: result.Items,
		nextKey: encodeNextKey(result.LastEvaluatedKey)
	}
}
