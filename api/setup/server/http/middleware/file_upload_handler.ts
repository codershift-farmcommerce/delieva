import { Context } from 'koa'
import { formidable, File } from 'formidable'

export default async (ctx: Context, next: Function): Promise<void> => {
  const path = ctx.path.slice(1)
  if (path.includes('importFromExcel') && ctx.method.toLowerCase() === 'post') {
    const form = formidable({ multiples: true })
    await new Promise<void>((resolve, reject) => {
      form.parse(ctx.req, (err, fields, files) => {
        if (err) {
          reject(err)
          return
        }
        const filePath = (files?.file as File)?.filepath
        if (!filePath) {
          reject(new Error('Missing file!'))
          return
        }
        ctx.uploadFilePath = filePath
        ctx.uploadData = JSON.parse((fields?.data as string) ?? '{}')
        resolve()
      })
    })
    await next()
  } else {
    await next()
  }
}
