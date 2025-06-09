import type { NextPage } from 'next'
import DataSnapshot from 'webapp/src/views/system_management/data_snapshot/data_snapshot'
import Base from 'webapp/src/pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<DataSnapshot />} />
}

export default Index
