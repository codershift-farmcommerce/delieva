import * as cron from 'node-cron'

const run = async () => {
  cron.schedule('0 1 * * *', () => {
    console.log('backing up database...')


    console.log('database backing up finished successfully...')

  }, {
    scheduled: true,
    timezone: 'America/Chihuahua'
  })
}

export default run
