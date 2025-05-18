'use client';           // keep this line if you’ll add motion / hooks later
import clsx from 'clsx';

export default function Card({ className, children, ...props }) {
  return (
    <div
      {...props}
      className={clsx(
        'rounded-2xl shadow-md bg-white/5 backdrop-blur p-4 border border-white/10',
        className
      )}
    >
      {children}
    </div>
  );
}
