// prisma/seed.ts
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: {
      id: 1,
    },
  });

  if (!user) {
    const result = await prisma.user.create({
      data: {
        id: 1,
        username: "demo",
        password: "demo",
      },
    });

    if (result) {
      await prisma.board.create({
        data: {
          title: "Todo",
          userId: 1,
          position: 0,
          Task: {
            create: [
              {
                title: "Set Up Development Environment",
                description:
                  "Install required packages, configure the code editor, and ensure all dependencies are running.",
                userId: 1,
                position: 0,
              },
              {
                title: "Design Homepage Layout",
                description: "Create wireframes and choose a color scheme for the main landing page.",
                userId: 1,
                position: 1,
              },
              {
                title: "Task 3",
                description:
                  "Integrate sign-up, login, and logout functionality using a secure authentication system.",
                userId: 1,
                position: 2,
              },
            ],
          },
        },
      });

      await prisma.board.create({
        data: {
          title: "In Progress",
          userId: 1,
          position: 1,
          Task: {
            create: [
              {
                title: "Optimize Database Queries",
                description:
                  "Review current queries, add necessary indexes, and improve performance to reduce load times.",
                userId: 1,
                position: 0,
              },
              {
                title: "Write Unit Tests for API Endpoints",
                description:
                  "Add test coverage for all REST endpoints, ensuring reliability and correct behavior",
                userId: 1,
                position: 1,
              },
            ],
          },
        },
      });

      await prisma.board.create({
        data: {
          title: "Done",
          userId: 1,
          position: 2,
          Task: {
            create: [
              {
                title: "Create Onboarding Documentation",
                description:
                  "Write step-by-step instructions for new team members to quickly get started with the project",
                userId: 1,
                position: 0,
              },
              {
                title: "Implement Drag-and-Drop Feature",
                description:
                  "Allow users to reorder items interactively using a simple drag-and-drop interface",
                userId: 1,
                position: 1,
              },
              {
                title: "Add Dark Mode Support",
                description:
                  "Provide a dark theme option and a toggle switch for users to switch between light and dark interfaces",
                userId: 1,
                position: 2,
              },
            ],
          },
        },
      });
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
