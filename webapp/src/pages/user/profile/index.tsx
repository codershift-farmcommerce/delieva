import type { NextPage } from 'next'
import UserProfile from 'webapp//views/user/profile/profile'
import Base from 'webapp//pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<UserProfile />} />
}

export default Index
