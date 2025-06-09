import type { NextPage } from 'next'
import Users from 'webapp//views/system_management/users/users'
import Base from 'webapp//pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<Users />} />
}

export default Index
