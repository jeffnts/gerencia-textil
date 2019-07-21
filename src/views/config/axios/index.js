import axios from 'axios'
import { AXIOS_BASE_URL} from '../constants'

export const api = axios.create({
  baseURL: AXIOS_BASE_URL
})
