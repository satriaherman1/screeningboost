import LoginForm from '../components/LoginForm';

const Login = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="relative z-10 w-full max-w-md">
                <LoginForm />
                <p className="text-center text-blue-200 mt-6 text-sm">
                    © 2026 ScreeningBoost. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
