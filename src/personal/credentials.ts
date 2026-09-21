import type { RemoteProfileCredentials } from '@/services/api/contracts'

const prefix = 'biblia-app.profile.'

export interface StoredProfileCredentials {
  profileId: string
  secret: string
  recoveryCode: string
}

export function storeProfileCredentials(profile: RemoteProfileCredentials): StoredProfileCredentials {
  const credentials = {
    profileId: profile.profile_id,
    secret: profile.secret,
    recoveryCode: profile.recovery_code,
  }
  window.localStorage.setItem(`${prefix}${profile.profile_id}`, JSON.stringify(credentials))
  window.localStorage.setItem(`${prefix}last`, profile.profile_id)
  return credentials
}

export function getProfileCredentials(profileId: string): StoredProfileCredentials | undefined {
  const raw = window.localStorage.getItem(`${prefix}${profileId}`)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<StoredProfileCredentials>
    if (parsed.profileId === profileId && typeof parsed.secret === 'string' && typeof parsed.recoveryCode === 'string') {
      return parsed as StoredProfileCredentials
    }
  } catch {
    return undefined
  }
  return undefined
}
