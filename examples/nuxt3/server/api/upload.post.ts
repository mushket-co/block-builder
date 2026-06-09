import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  await readMultipartFormData(event)

  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    url: '/icons/image.svg',
  }
})
