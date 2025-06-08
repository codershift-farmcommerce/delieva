// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import conf from '../../config'
import request from 'request'

// We need this for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const params = req?.query?.params as string[]
  const path = params.join('/')
  const url = `${conf.API_URL}/${path}`
  req.pipe(request(url)).pipe(res)
}
