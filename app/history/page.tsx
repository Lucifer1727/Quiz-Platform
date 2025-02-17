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

export default function History() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
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
        const db = event.target.result;
        db.createObjectStore("attempts", { keyPath: "date" });
      };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Quiz Attempt History
      </h1>
      <div className=" flex flex-wrap gap-4 justify-start items-center p-2 ">
        {attempts.length > 0 ? (
          attempts.map((attempt, index) => (
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
      <Button
        onClick={() => router.push("/")}
        className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
      >
        Back to Quiz
      </Button>
    </div>
  );
}
