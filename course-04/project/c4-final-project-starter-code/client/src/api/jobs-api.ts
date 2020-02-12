import { apiEndpoint } from '../config'
import Axios from 'axios'

export async function getJobs(idToken: string): Promise<any[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/jobs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.items
}
