import React from 'react'

/**
 * Google Icon SVG following Google Branding Guidelines.
 * Standard 4-color Google 'G' logo without distortion or color modifications.
 */
const GoogleLogo = ({ className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
)

/**
 * ContinueWithGoogle Component
 * Complies with Google Identity Branding Guidelines:
 * - Un-distorted official 4-color Google "G" logo
 * - Official text phrasing: "Continue with Google" (or "Sign in with Google", "Sign up with Google")
 * - Proper contrast, padding, hover/focus state, touch-target height (min 40px/44px)
 * - Supports brutalist theme (matching Snitch design system) as well as official standard light & dark themes
 */
const ContinueWithGoogle = ({
  label = 'CONTINUE WITH GOOGLE',
  href = '/api/auth/google',
  onClick,
  variant = 'brutalist', // 'brutalist' | 'standard' | 'dark'
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // Theme styling variants
  const variantStyles = {
    // Snitch brutalist design variant
    brutalist:
      'bg-white text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-wider uppercase',
    // Google Standard Light (White button, dark text, subtle border)
    standard:
      'bg-white text-[#1f1f1f] font-medium border border-[#747775] hover:bg-[#f8f9fa] hover:border-[#5e605e] active:bg-[#f1f3f4] rounded-md shadow-xs',
    // Google Standard Dark (Dark button, light text)
    dark:
      'bg-[#131314] text-[#e3e3e3] font-medium border border-[#8e918f] hover:bg-[#1f1f20] hover:border-[#a1a4a2] active:bg-[#2b2b2c] rounded-md shadow-xs',
  }

  const baseStyles =
    'relative inline-flex items-center justify-center gap-3 w-full py-3.5 px-4 min-h-[44px] text-sm sm:text-base font-sans select-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'

  const combinedClasses = `${baseStyles} ${variantStyles[variant] || variantStyles.brutalist} ${className}`.trim()

  const content = (
    <>
      {isLoading ? (
        <svg
          className="w-5 h-5 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <div className="flex items-center justify-center w-5 h-5 shrink-0 bg-white rounded-full p-0.5">
          <GoogleLogo className="w-full h-full" />
        </div>
      )}
      <span className="truncate">{isLoading ? 'CONNECTING...' : label}</span>
    </>
  )

  // If href is provided and no custom onClick, render as styled <a> tag
  if (href && !onClick) {
    return (
      <a
        href={disabled ? undefined : href}
        className={`${combinedClasses} ${disabled ? 'pointer-events-none' : ''}`}
        aria-label={label}
        {...props}
      >
        {content}
      </a>
    )
  }

  // Otherwise render as <button>
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClasses}
      aria-label={label}
      {...props}
    >
      {content}
    </button>
  )
}

export default ContinueWithGoogle