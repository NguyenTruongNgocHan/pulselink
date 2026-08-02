#!/usr/bin/env node

const API_URL = (process.env.API_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const PASSWORD = process.env.PULSELINK_DEMO_PASSWORD ?? 'password'
const TIMEOUT_MS = 15_000

function fail(message) {
  throw new Error(message)
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers ?? {}),
    },
    body:
      options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    fail(`${options.method ?? 'GET'} ${path} returned ${response.status}: ${text}`)
  }
  return data
}

async function login(email) {
  const session = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password: PASSWORD },
  })
  if (!session?.accessToken || !session?.user?.id) {
    fail(`Login response for ${email} is incomplete`)
  }
  return session
}

function stompFrame(command, headers = {}, body = '') {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`)
  return `${command}\n${headerLines.join('\n')}\n\n${body}\0`
}

function decodeFrames(buffer) {
  const frames = []
  let remaining = buffer
  while (remaining.includes('\0')) {
    const index = remaining.indexOf('\0')
    const raw = remaining.slice(0, index).replace(/^\n+/, '')
    remaining = remaining.slice(index + 1)
    if (!raw.trim()) continue

    const split = raw.indexOf('\n\n')
    const head = split >= 0 ? raw.slice(0, split) : raw
    const body = split >= 0 ? raw.slice(split + 2) : ''
    const lines = head.split('\n')
    const command = lines.shift() ?? ''
    const headers = Object.fromEntries(
      lines
        .filter((line) => line.includes(':'))
        .map((line) => {
          const separator = line.indexOf(':')
          return [line.slice(0, separator), line.slice(separator + 1)]
        }),
    )
    frames.push({ command, headers, body })
  }
  return { frames, remaining }
}

function waitForFrame(socket, predicate, timeoutMessage) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error(timeoutMessage))
    }, TIMEOUT_MS)

    const onMessage = (event) => {
      buffer += typeof event.data === 'string' ? event.data : Buffer.from(event.data).toString()
      const decoded = decodeFrames(buffer)
      buffer = decoded.remaining
      for (const frame of decoded.frames) {
        if (frame.command === 'ERROR') {
          cleanup()
          reject(new Error(`STOMP ERROR: ${frame.body || JSON.stringify(frame.headers)}`))
          return
        }
        if (predicate(frame)) {
          cleanup()
          resolve(frame)
          return
        }
      }
    }

    const onClose = (event) => {
      cleanup()
      reject(new Error(`WebSocket closed before expected frame (${event.code})`))
    }

    function cleanup() {
      clearTimeout(timeout)
      socket.removeEventListener('message', onMessage)
      socket.removeEventListener('close', onClose)
    }

    socket.addEventListener('message', onMessage)
    socket.addEventListener('close', onClose)
  })
}

async function main() {
  const sarah = await login('sarah@pulselink.local')
  const emma = await login('emma@pulselink.local')
  const conversation = await api(`/api/v1/conversations/direct/${emma.user.id}`, {
    method: 'POST',
    token: sarah.accessToken,
  })

  const websocketUrl = new URL('/ws', API_URL)
  websocketUrl.protocol = websocketUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  const socket = new WebSocket(websocketUrl)

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WebSocket connection timed out')), TIMEOUT_MS)
    socket.addEventListener(
      'open',
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true },
    )
    socket.addEventListener(
      'error',
      () => {
        clearTimeout(timeout)
        reject(new Error('WebSocket connection failed'))
      },
      { once: true },
    )
  })

  const connected = waitForFrame(
    socket,
    (frame) => frame.command === 'CONNECTED',
    'STOMP CONNECTED frame timed out',
  )
  socket.send(
    stompFrame('CONNECT', {
      'accept-version': '1.2',
      host: new URL(API_URL).host,
      Authorization: `Bearer ${emma.accessToken}`,
      'heart-beat': '10000,10000',
    }),
  )
  await connected

  socket.send(
    stompFrame('SUBSCRIBE', {
      id: 'conversation-smoke',
      destination: `/topic/conversations/${conversation.id}`,
      ack: 'auto',
    }),
  )

  const marker = `realtime-smoke-${crypto.randomUUID()}`
  const eventPromise = waitForFrame(
    socket,
    (frame) => {
      if (frame.command !== 'MESSAGE') return false
      try {
        const event = JSON.parse(frame.body)
        return event.type === 'MESSAGE_CREATED' && event.message?.content === marker
      } catch {
        return false
      }
    },
    'Realtime message event was not received',
  )

  await api(`/api/v1/conversations/${conversation.id}/messages`, {
    method: 'POST',
    token: sarah.accessToken,
    body: {
      content: marker,
      clientMessageId: marker,
      attachmentIds: [],
    },
  })

  await eventPromise
  const history = await api(`/api/v1/conversations/${conversation.id}/messages`, {
    token: emma.accessToken,
  })
  if (!Array.isArray(history) || !history.some((message) => message.content === marker)) {
    fail('Realtime message was not persisted in PostgreSQL-backed history')
  }

  socket.send(stompFrame('DISCONNECT', { receipt: 'disconnect-smoke' }))
  socket.close()
  console.log('PASS realtime STOMP delivery and persisted history')
}

main().catch((error) => {
  console.error(`FAIL ${error.message}`)
  process.exit(1)
})
