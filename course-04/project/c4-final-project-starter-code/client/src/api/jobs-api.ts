import { apiEndpoint } from '../config'
import Axios from 'axios'
import {Todo} from "../types/Todo";

export async function getJobs(idToken: string): Promise<any[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Jobs: ', response.data)
  return response.data.items
}

export async function createJob(
  idToken: string,
  newJob: any
): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/jobs`,  JSON.stringify(newJob), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  console.log('Job created', response);
  return response.data.item
}

export async function deleteJob(
  idToken: string,
  jobId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/jobs/${jobId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}
