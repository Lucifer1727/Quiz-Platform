"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface QuizAttempt {
  date: string;
  score: number;
  totalQuestions: number;
}

const ITEMS_PER_PAGE = 5;

export default function History() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchAttempts = async () => {
      if ("indexedDB" in window) {
        const db = await openDatabase();
        const transaction = db.transaction(["attempts"], "readonly");
        const objectStore = transaction.objectStore("attempts");
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          setAttempts(event.target.result);
        };
      }
    };

    fetchAttempts();
  }, []);

  const openDatabase = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("QuizDatabase", 1);

      request.onerror = () => reject("Error opening database");

      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore("attempts", { keyPath: "date" });
      };
    });
  };

  const totalPages = Math.ceil(attempts.length / ITEMS_PER_PAGE);
  const currentAttempts = attempts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">
          Quiz Attempt History
        </h1>
        <Button
          onClick={() => router.push("/")}
          className="mb-4 bg-blue-500 text-white hover:bg-blue-600"
        >
          Back to Quiz
        </Button>
      </div>
      <div className="flex flex-wrap gap-4 justify-center items-center p-2 h-[40rem] overflow-auto">
        {currentAttempts.length > 0 ? (
          currentAttempts.map((attempt, index) => (
            <Card key={index} className="mb-4 bg-blue-50 shadow-lg rounded-lg">
              <CardHeader className="bg-blue-100 p-4 rounded-t-lg">
                <CardTitle className="text-blue-800">
                  Attempt on {new Date(attempt.date).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-blue-700">
                  Score: {attempt.score} / {attempt.totalQuestions}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-blue-700">No attempts recorded yet.</p>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Previous
        </Button>
        <span className="text-blue-700">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
