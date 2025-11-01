'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';

export default function LessonsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Уроки</h1>
          <p className="text-gray-600">Выберите урок для изучения</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Уроки скоро появятся</CardTitle>
            <CardDescription>
              Модуль с уроками находится в разработке
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Здесь будут доступны все уроки для развития вашей харизмы.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
