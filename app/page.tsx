import Quiz from "@/components/Quiz";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center font-serif text-blue-800">
        Quiz Platform
      </h1>
      <Quiz />
    </main>
  );
}
