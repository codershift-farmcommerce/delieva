import type { NextPage } from 'next'
import UserProfile from 'webapp/src/views/user/profile/profile'
import Base from 'webapp/src/pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<UserProfile />} />
}

export default Index
