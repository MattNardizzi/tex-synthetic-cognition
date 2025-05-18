'use client';

/**
 * Simple Card component family (Card, CardHeader, CardContent, CardFooter)
 * Tailwind‑friendly placeholders that unblock the build until shadcn / full UI kit is added.
 */

export function Card({ className = '', children, ...props }) {
  return (
    <div
      {...props}
      className={`rounded-2xl shadow-md p-4 bg-white/5 backdrop-blur border border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div {...props} className={`mb-2 text-lg font-semibold ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div {...props} className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div {...props} className={`mt-2 text-sm opacity-80 ${className}`}>
      {children}
    </div>
  );
}
