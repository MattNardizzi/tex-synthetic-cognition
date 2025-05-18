// 'use client' keeps React hooks / motion happy if you add them later
'use client';
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
