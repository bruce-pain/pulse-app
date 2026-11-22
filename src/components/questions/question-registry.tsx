import type { ComponentType } from "react";

import { FileUploadQuestion } from "@/components/questions/types/file-upload-question";
import { LongTextQuestion } from "@/components/questions/types/long-text-question";
import { MultipleChoiceQuestion } from "@/components/questions/types/multiple-choice-question";
import { RatingQuestion } from "@/components/questions/types/rating-question";
import { ShortTextQuestion } from "@/components/questions/types/short-text-question";
import type { AnswerValue, FileAnswer, FormQuestion, QuestionType } from "@/types/form";

/** Props every question input receives. */
export interface QuestionInputProps {
  question: FormQuestion;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  inputId: string; // id for the main input (text/file)
  labelledBy: string; // id of the question's visible label
  describedBy?: string; // id(s) of help text / error message
  invalid: boolean;
  /** Live mode only: uploads a picked file and returns its reference. */
  uploadFile?: (file: File) => Promise<FileAnswer>;
}

// Maps every question type to the component that renders it.
// To add a type: add it to QuestionType, write a component, register it here.
export const questionRegistry: Record<
  QuestionType,
  ComponentType<QuestionInputProps>
> = {
  short_text: ShortTextQuestion,
  long_text: LongTextQuestion,
  multiple_choice: MultipleChoiceQuestion,
  rating: RatingQuestion,
  file_upload: FileUploadQuestion,
};
