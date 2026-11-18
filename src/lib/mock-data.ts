import type { Form } from "@/types/form";

export const mockForm: Form = {
  form_id: "form-001",
  version: 1,
  title: "Sprint Feedback",
  type: "feedback",
  status: "draft",
  settings: {
    anonymous: true,
    one_response: false,
    deadline: null,
  },
  questions: [
    {
      id: "question-001",
      type: "rating",
      label: "How was the sprint overall?",
      help_text: "Rate your experience from 1 to 5.",
      required: true,
      config: {
        min: 1,
        max: 5,
      },
    },
    {
      id: "question-002",
      type: "long_text",
      label: "What slowed us down?",
      required: true,
      config: {
        max_length: 2000,
      },
    },
    {
      id: "question-003",
      type: "multiple_choice",
      label: "Which area needs the most attention?",
      help_text: "Choose the area that needs the most improvement.",
      required: false,
      config: {
        options: ["Tooling", "Scope", "Reviews", "Testing"],
        allow_multiple_answers: false,
      },
    },
    {
      id: "question-004",
      type: "short_text",
      label: "Anything you want to flag to leads?",
      required: false,
      config: {
        max_length: 255,
      },
    },
    {
      id: "question-005",
      type: "file_upload",
      label: "Attach anything that backs this up",
      help_text: "PDF, DOC or DOCX, up to 5 MB.",
      required: false,
      config: {
        max_file_size_mb: 5,
        allowed_file_types: [".pdf", ".doc", ".docx"],
      },
    },
  ],
};

export const mockForms: Form[] = [
  mockForm,
  {
    form_id: "form-002",
    version: 1,
    title: "New Employee Feedback",
    type: "feedback",
    status: "published",
    settings: {
      anonymous: false,
      one_response: true,
      deadline: null,
    },
    questions: [
      {
        id: "question-006",
        type: "short_text",
        label: "What is your name?",
        required: true,
        config: {
          max_length: 255,
        },
      },
      {
        id: "question-007",
        type: "rating",
        label: "How was your onboarding experience?",
        required: true,
        config: {
          min: 1,
          max: 5,
        },
      },
    ],
  },
  {
    form_id: "form-003",
    version: 1,
    title: "Office Snack Poll",
    type: "poll",
    status: "closed",
    settings: {
      anonymous: false,
      one_response: true,
      deadline: null,
    },
    questions: [
      {
        id: "question-008",
        type: "multiple_choice",
        label: "Which snack should we stock?",
        required: true,
        config: {
          options: ["Biscuits", "Fruit", "Popcorn", "Yoghurt"],
          allow_multiple_answers: false,
        },
      },
    ],
  },
];
