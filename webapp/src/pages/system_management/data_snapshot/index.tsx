import type { NextPage } from 'next'
import DataSnapshot from 'src/views/system_management/data_snapshot/data_snapshot'
import Base from 'src/pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<DataSnapshot />} />
}

export default Index
