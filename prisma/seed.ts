import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    {
      name: 'admin',
      description: 'Administrator with full access to all features',
    },
    {
      name: 'executive',
      description: 'Executive with access to management features',
    },
    {
      name: 'telecaller',
      description: 'Telecaller with access to calling and basic CRM features',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`Created/Updated role: ${role.name}`);
  }

  // Create sample enquiry sources
  const enquirySources = [
    { name: 'Website' },
    { name: 'Instagram' },
    { name: 'Facebook' },
    { name: 'Referral' },
    { name: 'Walk-in' },
    { name: 'Phone Call' },
    { name: 'Google Ads' },
  ];

  for (const source of enquirySources) {
    await prisma.enquirySource.upsert({
      where: { name: source.name },
      update: {},
      create: source,
    });
    console.log(`Created/Updated enquiry source: ${source.name}`);
  }

  // Create sample branches
  const branches = [
    {
      name: 'Main Branch',
      address: '123 Main Street, City Center',
      phone: '+91 9876543210',
      email: 'main@institute.com',
    },
    {
      name: 'East Branch',
      address: '456 East Avenue, East District',
      phone: '+91 9876543211',
      email: 'east@institute.com',
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { name: branch.name },
      update: {},
      create: branch,
    });
    console.log(`Created/Updated branch: ${branch.name}`);
  }

  // Create sample courses
  const courses = [
    {
      name: 'Web Development',
      description:
        'Full-stack web development course covering HTML, CSS, JavaScript, React, and Node.js',
      duration: '6 months',
    },
    {
      name: 'Digital Marketing',
      description:
        'Comprehensive digital marketing course including SEO, SEM, Social Media Marketing',
      duration: '4 months',
    },
    {
      name: 'Data Science',
      description: 'Data science and machine learning course with Python, R, and ML algorithms',
      duration: '8 months',
    },
    {
      name: 'Graphic Design',
      description: 'Creative graphic design course with Adobe Creative Suite',
      duration: '3 months',
    },
    {
      name: 'Mobile App Development',
      description: 'Native and cross-platform mobile app development with React Native and Flutter',
      duration: '5 months',
    },
    {
      name: 'UI/UX Design',
      description: 'User interface and user experience design course with Figma and Adobe XD',
      duration: '4 months',
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { name: course.name },
      update: {},
      create: course,
    });
    console.log(`Created/Updated course: ${course.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
