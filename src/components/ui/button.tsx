// Placeholder for shadcn/ui button component
// This will be replaced when shadcn/ui is properly installed

export function Button({ children, ...props }: any) {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      {...props}
    >
      {children}
    </button>
  )
}

// Made with Bob
