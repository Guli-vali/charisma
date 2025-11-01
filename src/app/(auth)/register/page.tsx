'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  passwordConfirm: z.string(),
  goals: z.object({
    work: z.boolean().default(false),
    dating: z.boolean().default(false),
    leadership: z.boolean().default(false),
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, user, loading, initialize } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      goals: {
        work: false,
        dating: false,
        leadership: false,
      },
    },
  });

  const goals = watch('goals');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      toast.success('Аккаунт успешно создан!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGoal = (goal: 'work' | 'dating' | 'leadership') => {
    setValue(`goals.${goal}`, !goals[goal], { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card elevated className="bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="relative"
              >
                <Image
                  src="/logo.png"
                  alt="Charisma Pro Logo"
                  width={80}
                  height={80}
                  className="rounded-2xl shadow-lg"
                  priority
                />
              </motion.div>
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Charisma Pro
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Создайте свой аккаунт
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Имя"
                type="text"
                placeholder="Ваше имя"
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Пароль"
                type="password"
                placeholder="Минимум 8 символов"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Подтверждение пароля"
                type="password"
                placeholder="Повторите пароль"
                error={errors.passwordConfirm?.message}
                {...register('passwordConfirm')}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Выберите цели (можно несколько):
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={goals.work}
                      onChange={() => toggleGoal('work')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Работа</span>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={goals.dating}
                      onChange={() => toggleGoal('dating')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Знакомства</span>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={goals.leadership}
                      onChange={() => toggleGoal('leadership')}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Лидерство</span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSubmitting || loading}
              >
                Создать аккаунт
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Войти
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
