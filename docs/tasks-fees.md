# Fee Collection Feature Implementation

This document outlines the comprehensive tasks required to implement a fee collection feature within the existing Next.js CRM application. The tasks follow established patterns from the invoice and admission features and are presented in a story point view with checkboxes for easy tracking and completion by an AI coding agent.

## Prerequisites (Fee Collection Feature)

- [ ] **pdfme Documentation Reference**: Use Context7 MCP for latest pdfme documentation: `/pdfme/pdfme` (If PDF generation is required for receipts)
- [ ] **Package Management**: Always use PNPM as package manager (`pnpm add`, `pnpm dlx`)
- [ ] **Database Operations**: Use Prisma MCP for all database-related operations (e.g., `prisma db push`, `prisma generate`)
- [ ] **TypeScript Types**: Follow project rule - ALL interfaces/types MUST be in `@/types/` folder
- [ ] **Follow Existing Patterns**: Use patterns from invoice and admission features (e.g., server actions, UI components, data fetching)
- [ ] **UI Components**: Utilize shadcn/ui components for consistency.

## Story Point: Add Fee Collection Feature

### **Task 1: Database Schema Updates (Prisma)**

- [ ] **Define New Enums in `prisma/schema.prisma`**

  - [ ] Add enum `CollectedTowards { ADMISSION_FEE COURSE_FEE SEMESTER_FEE }`

- [ ] **Define `Receipt` Model in `prisma/schema.prisma`**

  - [ ] Add `Receipt` model with the following fields:
    ```prisma
    model Receipt {
      id               String           @id @default(auto()) @map("_id") @db.ObjectId
      receiptNumber    String           @unique // Auto-generated or sequential
      amountCollected  Decimal          @db.Decimal
      collectedTowards CollectedTowards
      paymentDate      DateTime         @default(now())
      paymentMode      String?          // e.g., Cash, Online, Cheque
      transactionId    String?          // For online/cheque payments
      notes            String?
      admissionId      String           @db.ObjectId
      admission        Admission        @relation(fields: [admissionId], references: [id])
      courseId         String           @db.ObjectId
      course           Course           @relation(fields: [courseId], references: [id])
      studentId        String?          @db.ObjectId // Optional: if student user model exists
      // student          User?            @relation(fields: [studentId], references: [id]) // Uncomment if User model is used for students
      createdById      String?          @db.ObjectId // Optional: if tracking who created the receipt
      // createdBy        User?            @relation(name: "CreatedReceipts", fields: [createdById], references: [id]) // Uncomment if User model is used
      createdAt        DateTime         @default(now())
      updatedAt        DateTime         @updatedAt
    }
    ```

- [ ] **Extend Existing Models in `prisma/schema.prisma`**

  - [ ] Extend `Course` model:
    - `courseFee Decimal? @db.Decimal`
    - `admissionFee Decimal? @db.Decimal`
    - `semesterFee Decimal? @db.Decimal` (Consider if fees are per semester or a total course fee)
  - [ ] Extend `Admission` model:
    - `totalFee Decimal? @db.Decimal` // Calculated or set at admission time
    - `balance Decimal @default(0) @db.Decimal`
    - `nextDueDate DateTime?`
    - `receipts Receipt[]` // Add relation to Receipt model

- [ ] **Run Prisma Commands**
  - [ ] Run `pnpm dlx prisma migrate dev --name add_fee_collection_schema` (or `pnpm dlx prisma db push` if not using migrations yet, but `migrate dev` is preferred)
  - [ ] Run `pnpm dlx prisma generate`

### **Task 2: TypeScript Types Setup (`@/types/`)**

- [ ] **Create TypeScript Types for Fee Collection in `@/types/fee-collection.ts`**

  - [ ] `CollectedTowards` enum (can be imported from Prisma generated types if preferred)
  - [ ] `Receipt` interface (extending Prisma's `Receipt` type, potentially with populated relations like `admission` and `course`)
  - [ ] `AdmissionWithReceiptsAndCourse` interface extending Prisma's `Admission` with `receipts` and `course` relations.
  - [ ] `CreateReceiptInput` type for form submission (matching server action input).
  - [ ] `UpdateReceiptInput` type for updates (matching server action input).
  - [ ] `ReceiptFormData` type for the `PaymentFormDialog` component (using Zod for schema definition is recommended).

    ```typescript
    // Example using Zod
    import { z } from "zod";
    import { CollectedTowards } from "@prisma/client"; // Assuming prisma client is generated

    export const ReceiptFormSchema = z.object({
      amountCollected: z.coerce
        .number()
        .positive({ message: "Amount must be positive" }),
      collectedTowards: z.nativeEnum(CollectedTowards),
      paymentDate: z.date(),
      paymentMode: z.string().optional(),
      transactionId: z.string().optional(),
      notes: z.string().optional(),
      admissionId: z.string(), // Will be passed to the form
      courseId: z.string(), // Will be passed to the form
    });

    export type ReceiptFormData = z.infer<typeof ReceiptFormSchema>;
    ```

  - [ ] `FeeCalculationResult` type for balance calculations (e.g., `{ totalPaid: Decimal, remainingBalance: Decimal, nextDueDate?: Date }`).

### **Task 3: Server Actions Setup (`src/app/actions/fee-collection-actions.ts`)**

- [ ] **Create Fee Collection Server Actions File**
  - [ ] Create `src/app/actions/fee-collection-actions.ts` following existing patterns (e.g., error handling, authentication/authorization checks).
- [ ] **Implement Server Actions:**

  - [ ] `createReceipt(data: CreateReceiptInput)`:
    - Validate input using Zod schema.
    - Use `prisma.$transaction` to create the receipt and update the admission balance.
    - Recalculate `Admission.balance` based on `Admission.totalFee` and sum of `Receipt.amountCollected` for that admission.
    - Implement `revalidatePath('/admissions/[id]/payments')` and potentially `revalidateTag` for relevant tags.
  - [ ] `updateReceipt(id: string, data: UpdateReceiptInput)`:
    - Validate input.
    - Use `prisma.$transaction` to update the receipt and adjust the admission balance differentially.
    - Recalculate `Admission.balance`.
    - Implement `revalidatePath`.
  - [ ] `deleteReceipt(id: string)`:
    - Use `prisma.$transaction` to delete the receipt and update the admission balance.
    - Recalculate `Admission.balance`.
    - Implement `revalidatePath`.
  - [ ] `getReceiptsByAdmissionId(admissionId: string, options?: { sortBy?: string, sortOrder?: 'asc' | 'desc', filterBy?: string, filterValue?: string })`:
    - Fetch receipts for a specific admission.
    - Include relations like `course`.
    - Implement server-side sorting and filtering capabilities (Prisma `orderBy` and `where` clauses).
  - [ ] `getAdmissionWithFeeDetails(admissionId: string)`:

    - Fetch admission details including `course`, `receipts`, `totalFee`, and `balance`.
    - This will be used by the payments page.

    ```typescript
    // Example structure for getAdmissionWithFeeDetails
    // import prisma from '@/lib/prisma'; // Assuming prisma client instance
    // import { AdmissionWithReceiptsAndCourse } from '@/types/fee-collection';

    // export async function getAdmissionWithFeeDetails(admissionId: string): Promise<AdmissionWithReceiptsAndCourse | null> {
    //   return prisma.admission.findUnique({
    //     where: { id: admissionId },
    //     include: {
    //       course: true,
    //       receipts: {
    //         orderBy: { paymentDate: 'desc' },
    //       },
    //     },
    //   });
    // }
    ```

### **Task 4: Page Architecture & Data Fetching (`/app/admissions/[id]/payments/page.tsx`)**

- [ ] **Enhance Fee Collection Page (`/app/admissions/[id]/payments/page.tsx`)**
  - [ ] Use server component pattern.
  - [ ] Fetch admission details (including course info, total fee, balance) and receipts using `getAdmissionWithFeeDetails` server action.
  - [ ] Display admission summary: Candidate Name, Course Name, Total Fee, Amount Paid, Balance Due.
  - [ ] Pass fetched receipts to the `PaymentsTable` component.
  - [ ] Pass necessary props (e.g., `admissionId`, `courseId`, `currentBalance`, `totalFee`) to `PaymentFormDialog`.
  - [ ] Implement error handling (e.g., `notFound()` if admission ID is invalid or data fetching fails).
  - [ ] Ensure proper TypeScript types are used for props and fetched data.

### **Task 5: Advanced DataTable Implementation (`@/components/payments/payments-table.tsx`)**

- [ ] **Create/Enhance `PaymentsTable` Component**
  - [ ] If not existing, create `src/components/payments/payments-table.tsx`.
  - [ ] Implement DataTable using `shadcn/ui/table` and patterns from `@tanstack/react-table`.
  - [ ] Define columns: Receipt Number, Payment Date, Amount Collected (formatted currency), Collected Towards (Fee Type), Payment Mode, Notes, Actions (Edit, Delete, Print Receipt).
  - [ ] Use `Decimal.js` for accurate monetary value formatting (e.g., `new Decimal(amount).toFixed(2)`).
  - [ ] Implement client-side sorting and filtering initially. Consider server-side if performance becomes an issue with large datasets.
  - [ ] Add an empty state component (e.g., `No payments recorded yet.`) when no receipts exist.
  - [ ] Implement row actions (Edit, Delete) that trigger respective dialogs/confirmations.
  - [ ] (Future Enhancement) Implement row selection for bulk operations.

### **Task 6: Smart Form Dialog Component (`/app/admissions/[id]/payments/payment-form-dialog.tsx`)**

- [ ] **Enhance `PaymentFormDialog` Component**
  - [ ] Implement mode discrimination (`create` | `edit`). The dialog title and submit button text should change accordingly.
  - [ ] Use `react-hook-form` with Zod schema (`ReceiptFormSchema`) for validation.
  - [ ] Form fields: Amount Collected, Collected Towards (Dropdown), Payment Date (DatePicker), Payment Mode (Input/Select), Transaction ID (Input, conditional on Payment Mode), Notes (Textarea).
  - [ ] Pre-fill form for `edit` mode.
  - [ ] **Dynamic Fee Validation**:
    - When `collectedTowards` is `ADMISSION_FEE`, validate `amountCollected` against `Course.admissionFee` (minus already paid towards admission).
    - When `collectedTowards` is `COURSE_FEE` or `SEMESTER_FEE`, validate `amountCollected` against remaining `Admission.balance`.
  - [ ] **Real-time Balance Preview**: Show how the current payment will affect the `Admission.balance`.
  - [ ] Handle form submission by calling `createReceipt` or `updateReceipt` server actions.
  - [ ] Show loading state during submission and provide feedback (success/error toasts using `sonner`).
  - [ ] Close dialog on successful submission and refresh data on the page.

### **Task 7: Enhanced Delete Flow (`@/components/payments/delete-payment-confirmation-dialog.tsx`)**

- [ ] **Create `DeletePaymentConfirmationDialog` Component**
  - [ ] Create `src/components/payments/delete-payment-confirmation-dialog.tsx`.
  - [ ] Use `shadcn/ui/alert-dialog`.
  - [ ] Display receipt details (Receipt Number, Amount, Date) to be deleted.
  - [ ] Show impact preview: "Deleting this payment will increase the balance due by [amount]."
  - [ ] Handle asynchronous deletion process by calling `deleteReceipt` server action.
  - [ ] Show loading state and provide feedback.
  - [ ] (Optional) Implement optimistic updates with rollback on failure if desired for UX.

### **Task 8: Business Logic & Utilities (`@/lib/fee-utils.ts`)**

- [ ] **Create Fee Calculation Utilities**
  - [ ] Create `src/lib/fee-utils.ts`.
  - [ ] `calculateAdmissionBalance(admission: AdmissionWithReceiptsAndCourse): { totalPaid: Decimal, balanceDue: Decimal }`:
    - Takes an admission object with its receipts and course details.
    - Calculates `totalPaid` by summing `amountCollected` from all receipts.
    - Calculates `balanceDue` as `admission.totalFee - totalPaid`.
    - Ensure all calculations use `Decimal.js` for precision.
  - [ ] `formatCurrency(amount: Decimal | number | string): string`:
    - Utility to format numbers/Decimals as currency (e.g., ₹1,234.56).
  - [ ] (Future Enhancement) Logic for payment plans, due date calculations, late fees, etc.
  - [ ] (Future Enhancement) Audit trail for balance changes (could be a separate Prisma model `BalanceAuditLog`).

### **Task 9: UI/UX Refinements and Production Readiness**

- [ ] **Component Composition and Styling**
  - [ ] Ensure components like `PaymentsTable` and `PaymentFormDialog` are well-composed and reusable.
  - [ ] Use Tailwind CSS for styling, adhering to project's design system.
  - [ ] Implement loading skeletons for the payments table and summary section while data is fetching.
- [ ] **Responsiveness**
  - [ ] Ensure the payments page, table, and dialogs are responsive on mobile devices.
  - [ ] Consider adaptive layouts for the table on smaller screens (e.g., card view per payment).
- [ ] **Accessibility (ARIA)**
  - [ ] Add proper ARIA labels and attributes to interactive elements (buttons, form fields, dialogs).
  - [ ] Ensure keyboard navigability.
- [ ] **Error Handling and User Feedback**
  - [ ] Consistent use of toasts (`sonner`) for operations (create, update, delete).
  - [ ] Clear error messages for form validation and server action failures.

### **Task 10: Database Seeding (Optional but Recommended)**

- [ ] **Update Database Seeding in `prisma/seed.ts`**
  - [ ] Add sample `Receipt` data linked to existing sample `Admission` and `Course` records.
  - [ ] Include receipts with different `collectedTowards` types.
  - [ ] Ensure seeded data helps in testing the fee calculation and display logic.
  - [ ] Run `pnpm prisma db seed` after updating the seed script.

### **Task 11: Documentation**

- [ ] **Code Documentation (JSDoc)**
  - [ ] Add JSDoc comments to new server actions, utility functions, and complex components.
- [ ] **Update Project README or Feature Documentation**
  - [ ] Briefly document the new Fee Collection feature, its capabilities, and how to manage payments.

This structured task list should provide a clear path for implementing the fee collection feature. Remember to commit changes frequently and test each part thoroughly.
