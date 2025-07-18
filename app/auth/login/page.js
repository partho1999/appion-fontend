import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to Appion</h2>
          <p className="mt-2 text-gray-600">Access your healthcare dashboard</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
