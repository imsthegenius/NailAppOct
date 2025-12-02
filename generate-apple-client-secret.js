import { readFileSync } from 'fs'
import { SignJWT, importPKCS8 } from 'jose'

const teamId = '6VLN4PNWB2'
const keyId = 'L54497MBQU'
const clientId = 'com.nailglow.app' // use your Service ID instead if applicable
const privateKeyPem = readFileSync('/Users/imraan/Downloads/AuthKey_L54497MBQU.p8', 'utf8')

async function createSecret() {
  const privateKey = await importPKCS8(privateKeyPem, 'ES256')
  const now = Math.floor(Date.now() / 1000)

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 180) // max 180 days
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(privateKey)

  console.log(token)
}

createSecret().catch((err) => {
  console.error(err)
  process.exit(1)
})
