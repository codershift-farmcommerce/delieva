import { Ctx } from 'src/app/context'

export function attachFile(ctx: Ctx, filePath: string, fileName: string) {
  ctx.attachment(filePath)
  ctx.set('Content-Type', 'application/force-download')
  ctx.set('Content-disposition', 'attachment; filename=' + fileName)
}
