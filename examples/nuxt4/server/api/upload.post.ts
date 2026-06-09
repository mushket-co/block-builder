import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  // Обязательно прочитать тело — иначе multipart POST может зависнуть в pending (Nuxt 4 / Nitro)
  await readMultipartFormData(event)

  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    url: '/icons/image.svg',
  }
})
