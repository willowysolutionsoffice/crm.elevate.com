import prisma from '@/lib/prisma';
import { AdmissionFormDialog } from '../../../components/admission-form-dialog';

export default async function AdmissionsPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const enquirySources = await prisma.enquirySource.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admissions</h1>
          <p className="text-gray-600">Manage and track all admissions</p>
        </div>
        <AdmissionFormDialog courses={courses} enquirySources={enquirySources} />
      </div>
    </div>
  );
}
