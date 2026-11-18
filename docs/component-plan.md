## Design decisions

- Use shared components for repeated interface patterns, including page headers, loading states, error states, empty states, and access-denied states.
- Keep question types reusable across the form builder preview and the public respondent page.
- Organize components by feature, such as authentication, forms, form builder, respondents, results, and administration.
- Separate UI components from API communication to make it easier to connect the frontend to the backend.
- Include appropriate loading, error, empty, and access-control states for the relevant screens.
- Keep the initial implementation aligned with the MVP requirements.
- Defer full screen and UI component implementation until the designated UI-building sprint.


## Proposed component breakdown

### 1. Shared components
Reusable across multiple screens.

- `PageHeader`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `AccessDenied`
- `StatusBadge`
- `ConfirmDialog`
- `AppNavbar`

### 2. Authentication
- `LoginForm`
- `AuthInput`
- `AuthError`
- `ForgotPasswordLink`

### 3. Forms
- `FormsList`
- `FormCard` / `FormTable`
- `FormFilters`
- `FormSearch`
- `FormStatusSummary`
- `FormActions`

### 4. Form builder
- `FormBuilder`
- `QuestionList`
- `QuestionCard`
- `QuestionTypePicker`
- `QuestionEditor`
- `FormSettings`
- `FormPreview`
- `PublishButton`

### 5. Reusable question components
These should support both builder preview and public form rendering.

- `ShortTextQuestion`
- `LongTextQuestion`
- `MultipleChoiceQuestion`
- `RatingQuestion`
- `FileUploadQuestion`

### 6. Public forms and responses
- `PublicFormHeader`
- `PublicFormRenderer`
- `ResponseForm`
- `QuestionRenderer`
- `FileUploadField`
- `FormValidationMessage`
- `SubmissionConfirmation`
- `SubmissionError`
- `ClosedFormMessage`

### 7. Results
- `ResultsHeader`
- `ResultsOverview`
- `ResponseSummary`
- `QuestionResults`
- `IndividualResponses`
- `ExportMenu`

### 8. Administration
- `AdminDashboard`
- `UserManagement`
- `RoleManagement`
- `ProjectManagement`
- `ApiKeyManagement`

### Implementation priorities

**MVP (P0):**
- Authentication
- Forms list and creation
- Form builder and all five question types
- Public response page
- Submission validation and confirmation
- Basic results and individual responses
- CSV and Excel export
- Access control and relevant UI states

**Phase 2 (P1):**
- AI insights and sentiment analysis
- Project registration and feedback integration
- JSON export
- Additional administration functionality where required.

Components will be implemented incrementally according to the agreed sprint priorities. The breakdown is a proposed structure, not a claim that all components have already been implemented.