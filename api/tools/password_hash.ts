import * as bcrypt from 'bcrypt'
import * as readline from 'node:readline'

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12)
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
rl.question(`Password: `, async password => {
  const hashedPassword = await hashPassword(password)
  console.log(`Hashed password: ${hashedPassword}`)
  rl.close()
})
