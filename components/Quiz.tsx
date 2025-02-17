"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import quizData from "@/data/quizData";

const SECONDS_PER_QUESTION = 30;

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return SECONDS_PER_QUESTION;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Removed unnecessary dependency: currentQuestionIndex

  const saveAttemptToIndexedDB = async (score: number) => {
    if ("indexedDB" in window) {
      const db = await openDatabase();
      const transaction = db.transaction(["attempts"], "readwrite");
      const objectStore = transaction.objectStore("attempts");
      const attempt = {
        date: new Date().toISOString(),
        score,
        totalQuestions: quizData.length,
      };
      objectStore.add(attempt);
    }
  };

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

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer("");
      setShowFeedback(false);
      setTimeLeft(SECONDS_PER_QUESTION);
    } else {
      setQuizCompleted(true);
      saveAttemptToIndexedDB(score);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setShowFeedback(false);
    setTimeLeft(SECONDS_PER_QUESTION);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-blue-50 shadow-lg rounded-lg">
        <CardHeader className="bg-blue-100 p-4 rounded-t-lg">
          <CardTitle className="text-blue-800 text-3xl font-semibold">
            Quiz Completed!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-2xl font-bold mb-4 text-blue-700">
            Your Score: {score} / {quizData.length}
          </p>
          <Progress
            value={(score / quizData.length) * 100}
            className="w-full h-4 bg-blue-200"
            style={{ borderRadius: "8px" }}
          />
        </CardContent>
        <CardFooter className="bg-blue-100 p-4 rounded-b-lg flex justify-end">
          <Button
            onClick={restartQuiz}
            className="mr-2 bg-blue-500 text-white hover:bg-blue-600"
          >
            Restart Quiz
          </Button>
          <Button
            onClick={() => router.push("/history")}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-100"
          >
            View History
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-blue-50 shadow-lg rounded-lg">
      <CardHeader className="bg-blue-100 p-4 rounded-t-lg">
        <CardTitle className="text-blue-800 text-3xl font-semibold">
          Question {currentQuestionIndex + 1} of {quizData.length}
        </CardTitle>
        <Progress
          value={(timeLeft / SECONDS_PER_QUESTION) * 100}
          className="w-full h-4 bg-blue-200"
          style={{ borderRadius: "8px" }}
        />
        <p className="text-blue-700 mt-2">Time left: {timeLeft} seconds</p>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-lg mb-4 text-blue-700">
          {currentQuestion.question}
        </p>
        <RadioGroup value={selectedAnswer} onValueChange={handleAnswer}>
          {currentQuestion.answers.map((answer, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value={answer} id={`answer-${index}`} />
              <Label htmlFor={`answer-${index}`} className="text-blue-700">
                {answer}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {showFeedback && (
          <p
            className={`mt-4 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {selectedAnswer === currentQuestion.correctAnswer
              ? "Correct!"
              : "Incorrect. The correct answer is: " +
                currentQuestion.correctAnswer}
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-blue-100 p-4 rounded-b-lg flex justify-end">
        {!showFeedback ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Next Question
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}