import type { NextPage } from 'next'
import ChangePassword from 'webapp//views/auth/change_password/change_password'
import Base from 'webapp//pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<ChangePassword />} hideMenu={true} />
}
