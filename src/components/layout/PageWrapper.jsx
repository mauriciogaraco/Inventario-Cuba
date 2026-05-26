// src/components/layout/PageWrapper.jsx
export default function PageWrapper({ children, className = '' }) {
  return (
    <main className={`flex-1 px-4 pt-4 pb-28 lg:pb-8 lg:pl-64 lg:pr-8 max-w-3xl lg:max-w-none mx-auto w-full ${className}`}>
      {children}
    </main>
  )
}
