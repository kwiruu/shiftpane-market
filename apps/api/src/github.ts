/**
 * The few GitHub calls sign-in needs: the web flow for the site, the device flow for the desktop app
 * and the CLI, and reading who signed in. No scopes are asked for, so the token can only read public
 * profile data, and it is dropped as soon as the profile is read.
 */

export interface GitHubUser {
  id: number
  login: string
  name: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: Date
}

export interface DeviceCode {
  deviceCode: string
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
}

export type DevicePoll =
  | { status: 'done'; token: string }
  | { status: 'pending' }
  | { status: 'slow_down'; interval: number }
  | { status: 'failed'; error: string }

export interface GitHub {
  authorizeUrl(state: string, redirectUri: string): string
  exchangeCode(code: string, redirectUri: string): Promise<string>
  user(token: string): Promise<GitHubUser>
  startDevice(): Promise<DeviceCode>
  pollDevice(deviceCode: string): Promise<DevicePoll>
}

export function createGitHub(clientId: string, clientSecret: string, fetcher = fetch): GitHub {
  const post = async (url: string, body: Record<string, string>) => {
    const response = await fetcher(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`GitHub answered ${response.status}`)
    return (await response.json()) as Record<string, unknown>
  }

  return {
    authorizeUrl(state, redirectUri) {
      const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, state })
      return `https://github.com/login/oauth/authorize?${params}`
    },

    async exchangeCode(code, redirectUri) {
      const body = await post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      })
      if (typeof body.access_token !== 'string') {
        throw new Error(`GitHub refused the sign-in: ${String(body.error ?? 'no token')}`)
      }
      return body.access_token
    },

    async user(token) {
      const response = await fetcher('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'shiftpane-registry',
        },
      })
      if (!response.ok) throw new Error(`GitHub answered ${response.status}`)
      const body = (await response.json()) as Record<string, unknown>
      return {
        id: Number(body.id),
        login: String(body.login),
        name: typeof body.name === 'string' ? body.name : null,
        bio: typeof body.bio === 'string' ? body.bio : null,
        avatarUrl: typeof body.avatar_url === 'string' ? body.avatar_url : null,
        createdAt: new Date(String(body.created_at)),
      }
    },

    async startDevice() {
      const body = await post('https://github.com/login/device/code', { client_id: clientId })
      return {
        deviceCode: String(body.device_code),
        userCode: String(body.user_code),
        verificationUri: String(body.verification_uri),
        expiresIn: Number(body.expires_in),
        interval: Number(body.interval),
      }
    },

    async pollDevice(deviceCode) {
      const body = await post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      })
      if (typeof body.access_token === 'string') return { status: 'done', token: body.access_token }
      if (body.error === 'authorization_pending') return { status: 'pending' }
      if (body.error === 'slow_down')
        return { status: 'slow_down', interval: Number(body.interval) }
      return { status: 'failed', error: String(body.error ?? 'unknown') }
    },
  }
}
