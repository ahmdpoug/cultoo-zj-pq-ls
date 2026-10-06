import { NextResponse } from 'next/server'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) return NextResponse.json({ error: err.message }, { status: err.status })
  console.error('[cult] unexpected error', err)
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
}
