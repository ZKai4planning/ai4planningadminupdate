import { NextResponse } from "next/server"
import { createDecipheriv } from "node:crypto"

export const dynamic = "force-dynamic"

type LeadRow = {
  id: number
  name: string
  email: string
  mobile: string
  service?: string
  consent: boolean
  submitted_at: string
}

type DecryptedLead = LeadRow

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseLeadsTable = process.env.SUPABASE_LEADS_TABLE ?? "leads"
const leadEncryptionKey = process.env.LEAD_AES_KEY

function getEncryptionKey() {
  if (!leadEncryptionKey) {
    throw new Error(
      "AES encryption is not configured. Add LEAD_AES_KEY to .env.local."
    )
  }

  const normalizedKey = leadEncryptionKey.trim()
  const isHexKey = /^[0-9a-fA-F]{64}$/.test(normalizedKey)
  const keyBuffer = isHexKey
    ? Buffer.from(normalizedKey, "hex")
    : Buffer.from(normalizedKey, "base64")

  if (keyBuffer.length !== 32) {
    throw new Error(
      "LEAD_AES_KEY must be a 32-byte key in hex or base64 format."
    )
  }

  return keyBuffer
}

function tryDecryptGcm(
  iv: Buffer,
  ciphertext: Buffer,
  authTag: Buffer
): string | null {
  try {
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ])
    return decrypted.toString("utf8")
  } catch {
    return null
  }
}

function decryptValue(value: string): string {
  // If the value isn't base64 or is too short, treat it as plaintext.
  try {
    const raw = Buffer.from(value, "base64")
    if (raw.length < 12 + 16 + 1) {
      return value
    }

    const iv = raw.subarray(0, 12)

    // Strategy A: [iv][authTag][ciphertext]
    const authTagA = raw.subarray(12, 28)
    const ciphertextA = raw.subarray(28)
    const resultA = tryDecryptGcm(iv, ciphertextA, authTagA)
    if (resultA !== null) return resultA

    // Strategy B: [iv][ciphertext||authTag]
    const combined = raw.subarray(12)
    if (combined.length >= 16) {
      const authTagB = combined.subarray(combined.length - 16)
      const ciphertextB = combined.subarray(0, combined.length - 16)
      const resultB = tryDecryptGcm(iv, ciphertextB, authTagB)
      if (resultB !== null) return resultB
    }

    return value
  } catch {
    // Fallback to original value when decryption fails (bad key/format).
    return value
  }
}

function decryptLead(row: LeadRow): DecryptedLead {
  return {
    ...row,
    name: decryptValue(row.name),
    email: decryptValue(row.email),
    mobile: decryptValue(row.mobile),
    service: decryptValue(row.service || ""),
  }
}

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    )
  }

  const url = new URL(`${supabaseUrl}/rest/v1/${supabaseLeadsTable}`)
  url.searchParams.set("select", "*")
  url.searchParams.set("order", "submitted_at.desc")

  const response = await fetch(url.toString(), {
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text()
    return NextResponse.json(
      { error: "Failed to fetch leads", details: text },
      { status: 500 }
    )
  }

  const data = (await response.json()) as LeadRow[]
  const decrypted = data.map(decryptLead)
  return NextResponse.json({ data: decrypted })
}
