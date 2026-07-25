import React, { useEffect, useRef } from 'react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || !buttonRef.current) return
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => onCredential(response.credential),
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    })
  }, [onCredential])

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="text-xs text-gray-400 text-center">
        Google sign-in isn't configured yet (set VITE_GOOGLE_CLIENT_ID).
      </p>
    )
  }

  return <div ref={buttonRef} className="flex justify-center" />
}
