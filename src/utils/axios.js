import axios from 'axios'

// axios 공통 인스턴스 생성
const apiClient = axios.create({
  baseURL: 'https://macsave-db-server.glitch.me',
  timeout: 5000,
})

export default apiClient
