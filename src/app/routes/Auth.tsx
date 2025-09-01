import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuth';
import { useNotifications } from '../../store/useUi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading } = useAuthStore();
  const { showSuccess, showError } = useNotifications();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (isLogin) {
        await login(data);
        showSuccess('Welcome back!', 'You have successfully logged in');
      } else {
        await register({
          ...data,
          name: data.email.split('@')[0], // Use email username as name
          confirmPassword: data.password,
        });
        showSuccess('Account created!', 'Your account has been created successfully');
      }
      navigate('/');
    } catch (error) {
      showError(
        isLogin ? 'Login failed' : 'Registration failed',
        error instanceof Error ? error.message : 'Something went wrong'
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-display">TheTCGBinder</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-slate-400">
            {isLogin 
              ? 'Sign in to your account to continue shopping'
              : 'Join our community of card collectors'
            }
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email address"
              type="email"
              {...registerField('email')}
              error={errors.email?.message}
              placeholder="Enter your email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...registerField('password')}
                error={errors.password?.message}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          {/* Demo Credentials */}
          {isLogin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <h3 className="text-sm font-medium text-slate-300 mb-2">Demo Credentials:</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div><strong>Admin:</strong> danielshalar5@gmail.com / admin1234@</div>
                <div><strong>User:</strong> user@example.com / password123</div>
              </div>
            </motion.div>
          )}

          {/* Toggle Form */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-red-400 hover:text-red-300 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Forgot Password */}
          {isLogin && (
            <div className="mt-4 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-slate-400 hover:text-slate-300"
              >
                Forgot your password?
              </Link>
            </div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="p-3 glass rounded-lg">
            <div className="text-red-400 text-sm font-medium">Secure</div>
            <div className="text-xs text-slate-400">Encrypted data</div>
          </div>
          <div className="p-3 glass rounded-lg">
            <div className="text-red-400 text-sm font-medium">Fast</div>
            <div className="text-xs text-slate-400">Quick checkout</div>
          </div>
          <div className="p-3 glass rounded-lg">
            <div className="text-red-400 text-sm font-medium">Trusted</div>
            <div className="text-xs text-slate-400">10k+ users</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
