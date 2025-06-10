# Invoice Generator Feature Implementation Tasks

This document outlines the comprehensive tasks required to implement an invoice generator feature within an existing Next.js CRM application. The tasks are presented in a story point view with checkboxes for easy tracking and completion by an AI coding agent.

## Prerequisites

- [ ] **pdfme Documentation Reference**: Use Context7 MCP for latest pdfme documentation: `/pdfme/pdfme`
- [ ] **Package Management**: Always use PNPM as package manager (`pnpm add`, `pnpm dlx`)
- [ ] **Database Operations**: Use Prisma MCP for all database-related operations
- [ ] **TypeScript Types**: Follow project rule - ALL interfaces/types MUST be in `@/types/` folder

## Story Point: Add a new feature: Invoices

### **Task 1: Database Schema Setup (Prisma)** ✅

- [x] **Define Invoice Model in Prisma Schema**

  - [x] Add `Invoice` model to `prisma/schema.prisma` with fields:
    - `id` (String, @id, @default(auto()), @map("\_id"), @db.ObjectId)
    - `invoiceNumber` (String, @unique, format: INV-YYYYMMDD-XXXX)
    - `billedTo` (String, client name, address, contact info)
    - `invoiceDate` (DateTime, @default(now()))
    - `dueDate` (DateTime, optional)
    - `subtotal` (Float)
    - `taxRate` (Float, default: 0.18 for 18% GST)
    - `taxAmount` (Float)
    - `totalAmount` (Float)
    - `status` (InvoiceStatus enum: DRAFT, SENT, PAID, OVERDUE, CANCELLED)
    - `notes` (String?, optional)
    - `createdAt` (DateTime, @default(now()))
    - `updatedAt` (DateTime, @updatedAt)

- [x] **Define InvoiceItem Model in Prisma Schema**

  - [x] Add `InvoiceItem` model to `prisma/schema.prisma` with fields:
    - `id` (String, @id, @default(auto()), @map("\_id"), @db.ObjectId)
    - `invoiceId` (String, @db.ObjectId, foreign key to Invoice)
    - `invoice` (Invoice relation)
    - `itemDescription` (String)
    - `quantity` (Int)
    - `unitPrice` (Float)
    - `lineTotal` (Float)
    - `createdAt` (DateTime, @default(now()))
    - `updatedAt` (DateTime, @updatedAt)

- [x] **Create TypeScript Types**

  - [x] Create `@/types/invoice.ts` with interfaces:
    - `Invoice` interface matching Prisma model
    - `InvoiceItem` interface matching Prisma model
    - `InvoiceStatus` enum
    - `CreateInvoiceInput` type
    - `UpdateInvoiceInput` type
    - `InvoiceFormData` type for forms

- [x] **Run Prisma Migration**
  - [x] Generated Prisma client for MongoDB (migrations not applicable for MongoDB)
  - [x] Verified schema update successful

### **Task 2: Invoice Actions Setup** ✅

- [x] **Create Invoice Server Actions**
  - [x] Create `src/app/actions/invoice-actions.ts` following existing patterns from `enquiry-action.ts`
  - [x] Implement server actions:
    - `createInvoice()` - Create new invoice with auto-generated invoice number
    - `updateInvoice()` - Update existing invoice
    - `deleteInvoice()` - Soft delete invoice
    - `getInvoices()` - Fetch all invoices with pagination
    - `getInvoiceById()` - Fetch single invoice with items
    - `addInvoiceItem()` - Add item to invoice
    - `updateInvoiceItem()` - Update invoice item
    - `deleteInvoiceItem()` - Remove item from invoice
    - `calculateInvoiceTotals()` - Recalculate invoice totals

### **Task 3: Invoice Data Table View (Shadcn UI)** ✅

- [x] **Create Invoice List Page**

  - [x] Create `src/app/(sidebar)/invoices/page.tsx`
  - [x] Follow existing pattern from `src/app/(sidebar)/enquiries/page.tsx`
  - [x] Implement data table using Shadcn UI components:
    - Use native table components (consistent with existing pattern)
    - Display columns: Invoice Number, Billed To, Date, Status, Total Amount
    - Add search/filter functionality
    - Include pagination

- [x] **Create Invoice Table Component**

  - [x] Integrate table directly in page component (following existing pattern)
  - [x] Follow pattern from existing table components
  - [x] Include action buttons for View, Edit, Delete, Generate PDF
  - [x] Add status badges with proper styling

### **Task 4: New Invoice Creation Dialog Form** ✅

- [x] **Create Invoice Form Dialog**

  - [x] Create `src/app/(sidebar)/invoices/new/page.tsx` (created as dedicated page instead of dialog)
  - [x] Follow pattern from existing form patterns
  - [x] Include form fields:
    - `billedTo` (textarea for client details)
    - `invoiceNumber` (auto-generated on server)
    - `invoiceDate` (date picker, default to today)
    - `dueDate` (date picker, optional)
    - `notes` (textarea, optional)
    - `taxRate` (number input with default 18%)
  - [x] Use `react-hook-form` with `zod` validation
  - [x] Implement proper error handling and success toast

- [ ] **Create Delete Invoice Dialog**
  - [ ] Create `src/components/invoice/delete-invoice-dialog.tsx`
  - [ ] Follow pattern from existing delete dialogs
  - [ ] Include confirmation and soft delete functionality

### **Task 5: Invoice Detail Page** ✅

- [x] **Create Dynamic Invoice Detail Page**

  - [x] Create `src/app/(sidebar)/invoices/[id]/page.tsx`
  - [x] Follow pattern from existing detail pages
  - [x] Display invoice header information (Billed To, Invoice Number, Date)
  - [x] Include editable invoice metadata

- [x] **Create Invoice Items Management**

  - [x] Create `src/components/invoice/invoice-items-section.tsx`
  - [x] Implement dynamic items table with:
    - Add/Remove item rows
    - Item Description, Quantity, Unit Price fields
    - Auto-calculated Line Total (quantity × unitPrice)
    - Real-time subtotal calculation
  - [x] Use server actions with proper error handling

- [x] **Create Invoice Totals Display**
  - [x] Create `src/components/invoice/invoice-totals.tsx`
  - [x] Display calculated totals:
    - Subtotal (sum of all line totals)
    - Tax Amount (configurable tax rate, default 18% GST)
    - Total Amount (Subtotal + Tax)
  - [x] Auto-update when items change via server recalculation

### **Task 6: PDF Generation Setup** ✅

- [x] **Install pdfme Dependencies**

  - [x] Install required packages: `pnpm add @pdfme/generator @pdfme/common @pdfme/schemas`
  - [x] Reference pdfme documentation via Context7 MCP for latest API patterns

- [x] **Create PDF Service**
  - [x] Create `src/lib/pdf-service.ts`
  - [x] Implement PDF generation functions:
    - `generateInvoicePDF(invoice)` - Generate PDF from invoice data
    - `loadInvoiceTemplate()` - Load template from public directory
    - `createDownloadableBlob()` - Create downloadable blob
    - `generateFileName()` - Generate appropriate filename
  - [x] Follow server-side generation patterns from pdfme docs

### **Task 7: Invoice PDF Template Integration** ✅

- [x] **Analyze Existing Template**

  - [x] Study `/public/pdf/invoice_template.json` structure
  - [x] Understand template fields mapping:
    - `billedToInput` → invoice.billedTo
    - `info.InvoiceNo` → invoice.invoiceNumber
    - `info.Date` → invoice.invoiceDate
    - `orders` → invoiceItems array (2D array format)
    - `taxInput.rate` → invoice.taxRate
    - Dynamic calculations for totals via template expressions

- [x] **Implement Template Data Mapping**
  - [x] Create `src/lib/invoice-template-mapper.ts`
  - [x] Map invoice data to template format:
    ```typescript
    const templateInputs = {
      billedToInput: invoice.billedTo,
      info: {
        InvoiceNo: invoice.invoiceNumber,
        Date: formatDate(invoice.invoiceDate),
      },
      orders: invoiceItems.map((item) => [
        item.itemDescription,
        item.quantity.toString(),
        item.unitPrice.toString(),
        item.lineTotal.toString(),
      ]),
      taxInput: { rate: (invoice.taxRate * 100).toString() },
    };
    ```

### **Task 8: Generate Invoice PDF Feature** ✅

- [x] **Create PDF Generation API Route**

  - [x] Create `src/app/api/invoices/[id]/pdf/route.ts`
  - [x] Implement PDF generation endpoint with GET and POST methods
  - [x] Return PDF as downloadable file with proper headers
  - [x] Include authentication and error handling

- [x] **Add PDF Generation UI**

  - [x] Add "Generate PDF" button to invoice detail page
  - [x] Add "Download PDF" action to invoices table
  - [x] Implement proper loading states and error handling
  - [x] Automatic download functionality with proper filename

- [x] **Enhance User Experience**
  - [x] Add PDF generation status feedback via toast notifications
  - [x] Implement automatic file download
  - [x] Proper error messaging and loading states

### **Task 9: Testing and Validation**

- [ ] **Test Database Operations**

  - [ ] Verify invoice creation with auto-generated invoice numbers
  - [ ] Test invoice items CRUD operations
  - [ ] Validate total calculations accuracy

- [ ] **Test PDF Generation**

  - [ ] Verify PDF output matches template design
  - [ ] Test with various invoice data scenarios
  - [ ] Ensure proper data formatting in generated PDFs

- [x] **UI/UX Testing**
  - [x] Test responsive design on different screen sizes
  - [x] Verify form validations work correctly
  - [x] Test navigation and user flows

### **Task 10: Documentation and Deployment**

- [x] **Code Documentation**

  - [x] Add JSDoc comments to all functions
  - [x] Document API endpoints
  - [x] Update README if needed

- [x] **Database Seeding**
  - [x] Add sample invoice data to `prisma/seed.ts`
  - [x] Include test invoice items for development

## Implementation Notes

### **Coding Standards**

- Follow existing patterns from enquiry components
- Use TypeScript strict mode with proper type definitions
- Implement proper error boundaries and loading states
- Use shadcn/ui components for consistency

### **Database Patterns**

- Follow MongoDB ObjectId patterns used in existing models
- Use Prisma relations properly
- Implement soft deletes where appropriate

### **PDF Generation Best Practices**

- Use server-side generation for security
- Implement proper error handling for PDF operations
- Cache generated PDFs if needed for performance
- Follow pdfme documentation patterns from Context7

### **Performance Considerations**

- Implement pagination for invoice lists
- Use optimistic updates for real-time calculations
- Consider caching strategies for frequently accessed data
- Optimize PDF generation for large invoices

---

# Admission Form Feature Implementation Tasks

This document section outlines the comprehensive tasks required to implement an admission form feature within the existing Next.js CRM application. The tasks follow established patterns from the invoice feature and are presented in a story point view with checkboxes for easy tracking and completion by an AI coding agent.

## Prerequisites (Admission Feature)

- [ ] **pdfme Documentation Reference**: Use Context7 MCP for latest pdfme documentation: `/pdfme/pdfme`
- [ ] **Package Management**: Always use PNPM as package manager (`pnpm add`, `pnpm dlx`)
- [ ] **Database Operations**: Use Prisma MCP for all database-related operations
- [ ] **TypeScript Types**: Follow project rule - ALL interfaces/types MUST be in `@/types/` folder
- [ ] **Follow Existing Patterns**: Use patterns from invoice and enquiry features

## Story Point: Add a new feature: Admissions

### **Task 1: Database Schema Setup (Prisma)** ✅

- [x] **Define Admission Model in Prisma Schema** ✅

  - [x] Add `Admission` model to `prisma/schema.prisma` with fields:
    - `id` (String, @id, @default(auto()), @map("\_id"), @db.ObjectId) ✅
    - `admissionNumber` (String, @unique, format: ADM-YYYYMMDD-XXXX) ✅
    - `candidateName` (String) ✅
    - `mobileNumber` (String) ✅
    - `email` (String?, optional) ✅
    - `gender` (AdmissionGender enum: MALE, FEMALE, OTHER) ✅
    - `dateOfBirth` (DateTime) ✅
    - `address` (String) ✅
    - `leadSource` (String?, optional - auto-filled from enquiry) ✅
    - `enquiryId` (String?, @db.ObjectId, optional foreign key to Enquiry) ✅
    - `lastQualification` (String) ✅
    - `yearOfPassing` (Int) ✅
    - `percentageCGPA` (String) ✅
    - `instituteName` (String) ✅
    - `additionalNotes` (String?, optional) ✅
    - `courseId` (String, @db.ObjectId, foreign key to Course) ✅
    - `courseTotalFee` (Float) ✅
    - `semesterFee` (Float?, optional) ✅
    - `admissionFee` (Float) ✅
    - `nextDueDate` (DateTime) ✅
    - `amountCollectedTowards` (AmountCollectedType enum: ADMISSION_FEE, SEMESTER_FEE, TOTAL_FEE) ✅
    - `paymentMode` (PaymentMode enum: CASH, UPI, CARD, BANK_TRANSFER) ✅
    - `transactionIdReferenceNumber` (String?, optional) ✅
    - `receiptNumber` (String, auto-generated) ✅
    - `remainingBalance` (Float) ✅
    - `status` (AdmissionStatus enum: PENDING, CONFIRMED, COMPLETED, CANCELLED) ✅
    - `createdByUserId` (String, foreign key to User) ✅
    - `createdAt` (DateTime, @default(now())) ✅
    - `updatedAt` (DateTime, @updatedAt) ✅

- [x] **Define New Enums in Prisma Schema** ✅

  - [x] Add `AdmissionGender` enum: MALE, FEMALE, OTHER ✅
  - [x] Add `AmountCollectedType` enum: ADMISSION_FEE, SEMESTER_FEE, TOTAL_FEE ✅
  - [x] Add `PaymentMode` enum: CASH, UPI, CARD, BANK_TRANSFER ✅
  - [x] Add `AdmissionStatus` enum: PENDING, CONFIRMED, COMPLETED, CANCELLED ✅

- [x] **Update Course Model in Prisma Schema** ✅

  - [x] Add relation to admissions: `admissions Admission[]` ✅
  - [x] Verify existing fields: `totalFee`, `semesterFee`, `admissionFee` are present ✅

- [x] **Create TypeScript Types** ✅

  - [x] Create `@/types/admission.ts` with interfaces:
    - `Admission` interface matching Prisma model
    - `AdmissionWithRelations` interface (with course, enquiry, createdBy)
    - `AdmissionGender`, `AmountCollectedType`, `PaymentMode`, `AdmissionStatus` enums
    - `CreateAdmissionInput` type for form submission
    - `UpdateAdmissionInput` type for updates
    - `AdmissionFormData` type for multi-step form
    - `AdmissionFilters` type for filtering/search
    - `ReceiptData` type for receipt generation

- [x] **Run Prisma Migration** ✅
  - [x] Generate Prisma client for MongoDB (migrations not applicable for MongoDB) ✅
  - [x] Verify schema update successful ✅

### **Task 2: Admission Actions Setup** ✅

- [x] **Create Admission Server Actions** ✅
  - [x] Create `src/app/actions/admission-actions.ts` following existing patterns from `invoice-actions.ts` ✅
  - [x] Implement server actions: ✅
    - `createAdmission()` - Create new admission with auto-generated admission number and receipt ✅
    - `updateAdmission()` - Update existing admission ✅
    - `deleteAdmission()` - Soft delete admission ✅
    - `getAdmissions()` - Fetch all admissions with pagination and filters ✅
    - `getAdmissionById()` - Fetch single admission with relations ✅
    - `getAdmissionsByEnquiry()` - Get admissions linked to an enquiry ✅
    - `generateReceiptNumber()` - Generate unique receipt number ✅
    - `calculateAdmissionTotals()` - Calculate remaining balance and totals ✅
    - `getCoursesForAdmission()` - Get active courses with fee details ✅

### **Task 3: Admission Data Table View (Shadcn UI)** ✅

- [x] **Create Admission List Page** ✅

  - [x] Create `src/app/(sidebar)/admissions/page.tsx` ✅
  - [x] Follow existing pattern from `src/app/(sidebar)/invoices/page.tsx` ✅
  - [x] Implement data table using native table components: ✅
    - Display columns: Admission Number, Candidate Name, Mobile, Course, Status, Total Fee, Remaining Balance, Created Date ✅
    - Add search/filter functionality by candidate name, mobile, course ✅
    - Include pagination ✅
    - Add status filter dropdown ✅
    - Export functionality ✅

- [x] **Create Admission Table Component Features** ✅

  - [x] Integrate table directly in page component (following existing pattern) ✅
  - [x] Follow pattern from existing table components ✅
  - [x] Include action buttons for View, Edit, Delete, Generate Receipt PDF ✅
  - [x] Add status badges with proper styling (follow invoice status styling) ✅
  - [x] Add course and fee display formatting ✅
  - [x] Include responsive design for mobile view ✅

### **Task 4: Multi-Step Admission Form Dialog** ✅

- [x] **Create Multi-Step Admission Form Dialog** ✅

  - [x] Create `src/components/admission/admission-form-dialog.tsx` ✅
  - [x] Follow pattern from existing form dialogs but implement multi-step functionality ✅
  - [x] Use `react-hook-form` with proper state management for multi-step form ✅
  - [x] Include stepper component for navigation ✅

- [x] **Step 1: Basic Details Form** ✅

  - [x] Candidate Name (Text input, required) ✅
  - [x] Mobile Number (Text input, required, validation for phone format) ✅
  - [x] Email (Email input, optional) ✅
  - [x] Gender (Select: Male/Female/Other, required) ✅
  - [x] Date of Birth (Date picker, required) ✅
  - [x] Address (Textarea, required) ✅
  - [x] Lead Source (Text input, auto-filled if from enquiry, otherwise editable) ✅

- [x] **Step 2: Education Details Form** ✅

  - [x] Last Qualification (Text input, required) ✅
  - [x] Year of Passing (Number input or dropdown, required) ✅
  - [x] Percentage/CGPA (Text input, required) ✅
  - [x] Institute Name (Text input, required) ✅
  - [x] Additional Notes (Textarea, optional) ✅

- [x] **Step 3: Course & Fee Details Form** ✅

  - [x] Course Selection (Dropdown populated from Course model, required) ✅
  - [x] Display dynamic course information on selection: ✅
    - Course Total Fee (Display only, auto-populated) ✅
    - Semester Fee (Display only if course has semester fee) ✅
    - Admission Fee (Display only, auto-populated) ✅
  - [x] Next Due Date (Date picker, required) ✅
  - [x] Amount Collected Towards (Dropdown: Admission Fee/Semester Fee/Total Fee) ✅
  - [x] Payment Mode (Dropdown: Cash/UPI/Card/Bank Transfer, required) ✅
  - [x] Transaction ID/Reference Number (Text input, conditional based on payment mode) ✅

- [x] **Step 4: Preview & Confirmation** ✅

  - [x] Display all entered values for review ✅
  - [x] Show calculated remaining balance ✅
  - [x] Clearly indicate optional fields that are empty ✅
  - [x] Show fee breakdown and payment details ✅
  - [x] Submit button to create admission ✅

### **Task 5: Individual Admission Detail Page** ✅

- [x] **Create Dynamic Admission Detail Page** ✅

  - [x] Create `src/app/(sidebar)/admissions/[id]/page.tsx` ✅
  - [x] Follow pattern from `src/app/(sidebar)/invoices/[id]/page.tsx` ✅
  - [x] Display comprehensive admission information in cards: ✅
    - Personal details card ✅
    - Education details card ✅
    - Course and fee details card ✅
    - Payment information card ✅
    - Receipt information card ✅

- [x] **Create Admission Detail Components** ✅

  - [x] Implemented admission details sections within main page component ✅
  - [x] Fee breakdown section with remaining balance highlighting ✅
  - [x] Payment history and receipt information ✅
  - [x] Status display with proper styling and icons ✅
  - [x] Follow existing component patterns for consistency ✅

### **Task 6: Receipt PDF Generation Setup** ✅

- [x] **Create Receipt PDF Template** ✅

  - [x] Create `public/pdf/receipt_template.json` ✅
  - [x] Design receipt template following the provided receipt format: ✅
    - Receipt header with number and date ✅
    - Student information ✅
    - Course information ✅
    - Fee breakdown (admission fee paid, total course fee, remaining balance) ✅
    - Payment details (mode, transaction reference) ✅
    - Next due date ✅
    - Thank you message ✅
    - Company footer ✅

- [x] **Create Receipt PDF Service** ✅

  - [x] Create `src/lib/receipt-pdf-service.ts` following `src/lib/pdf-service.ts` pattern ✅
  - [x] Implement receipt PDF generation functions: ✅
    - `generateReceiptPDF(admission)` - Generate receipt PDF from admission data ✅
    - `loadReceiptTemplate()` - Load template from public directory ✅
    - `validateAdmissionData()` - Validate admission data for receipt generation ✅
    - `generateReceiptFileName()` - Generate appropriate filename ✅

- [x] **Create Receipt Template Mapper** ✅

  - [x] Create `src/lib/receipt-template-mapper.ts` following `src/lib/invoice-template-mapper.ts` pattern ✅
  - [x] Map admission data to receipt template format: ✅
    - Map receipt number, date, student info ✅
    - Map course details and fee breakdown ✅
    - Map payment information ✅
    - Format currency values appropriately ✅

### **Task 7: Receipt PDF API and Generation** ✅

- [x] **Create Receipt PDF API Route** ✅

  - [x] Create `src/app/api/admissions/[id]/receipt/route.ts` ✅
  - [x] Follow pattern from `src/app/api/invoices/[id]/pdf/route.ts` ✅
  - [x] Implement GET method for receipt generation ✅
  - [x] Return PDF as downloadable file with proper headers ✅
  - [x] Include authentication and error handling ✅

- [x] **Add Receipt Generation UI** ✅

  - [x] Add "Generate Receipt" button to admission detail page ✅
  - [x] Add "Download Receipt" action to admissions table ✅
  - [x] Implement proper loading states and error handling ✅
  - [x] Automatic receipt generation functionality ✅

### **Task 8: Enhanced Features and Integrations**

- [ ] **File Upload Service (Optional)**

  - [ ] Create `src/lib/file-upload-service.ts` for ID proof uploads
  - [ ] Implement local file storage or cloud storage integration
  - [ ] Add file validation (file type, size limits)
  - [ ] Update admission form to handle file uploads

- [ ] **Enquiry to Admission Conversion**

  - [ ] Add "Convert to Admission" action in enquiry detail page
  - [ ] Pre-fill admission form with enquiry data
  - [ ] Link admission to original enquiry
  - [ ] Update enquiry status to "ENROLLED" when admission is created

- [ ] **Advanced Filtering and Search**

  - [ ] Implement advanced filters in admissions list:
    - Filter by course, status, date range
    - Search by candidate name, mobile, email
    - Filter by payment status
  - [ ] Add export functionality for admission data

### **Task 9: Delete Admission Dialog**

- [ ] **Create Delete Admission Dialog**
  - [ ] Create `src/components/admission/delete-admission-dialog.tsx`
  - [ ] Follow pattern from existing delete dialogs
  - [ ] Include confirmation with admission details
  - [ ] Implement soft delete with proper authorization

### **Task 10: Testing and Validation**

- [ ] **Test Database Operations**

  - [ ] Verify admission creation with auto-generated numbers
  - [ ] Test course fee calculations and remaining balance
  - [ ] Validate form submissions and validations
  - [ ] Test enquiry to admission conversion

- [ ] **Test Receipt Generation**

  - [ ] Verify receipt PDF output matches template design
  - [ ] Test with various admission scenarios
  - [ ] Ensure proper data formatting in generated receipts
  - [ ] Test automatic receipt generation on admission creation

- [ ] **UI/UX Testing**
  - [ ] Test multi-step form navigation and validation
  - [ ] Verify responsive design on different screen sizes
  - [ ] Test file upload functionality
  - [ ] Test search and filtering features

### **Task 11: Database Seeding and Documentation**

- [ ] **Update Database Seeding**

  - [ ] Add sample admission data to `prisma/seed.ts`
  - [ ] Include test admissions with different statuses
  - [ ] Add sample receipt data for development
  - [ ] Link sample admissions to existing courses

- [ ] **Code Documentation**
  - [ ] Add JSDoc comments to all functions
  - [ ] Document API endpoints and receipt generation
  - [ ] Update README with admission feature documentation

## Receipt Format Reference

```
-----------------------------------------------------
Receipt #: REC-20241215-001 | Date: 15 December 2024
-----------------------------------------------------
Student: Ravi Kumar
Course: Diploma in Digital Marketing
Admission Fee Paid: ₹5,000
Total Course Fee: ₹20,000
Remaining Balance: ₹15,000
Payment Mode: UPI
Transaction Ref: TXN8759232
Next Due Date: 15 January 2025
Thank you for your payment.
-----------------------------------------------------
```

## Implementation Notes (Admission Feature)

### **Coding Standards**

- Follow existing patterns from invoice and enquiry components
- Use TypeScript strict mode with proper type definitions in `@/types/` folder
- Implement proper error boundaries and loading states
- Use shadcn/ui components for consistency
- Follow multi-step form best practices with proper state management

### **Database Patterns**

- Follow MongoDB ObjectId patterns used in existing models
- Use Prisma relations properly between Admission, Course, User, and Enquiry
- Implement proper indexing for search functionality
- Follow existing enum patterns

### **Receipt Generation Best Practices**

- Use server-side PDF generation for security (same as invoice feature)
- Implement proper error handling for PDF operations
- Follow pdfme documentation patterns from Context7
- Generate receipts automatically on admission creation
- Store receipt metadata in database for tracking

### **File Upload Considerations**

- Start with URL storage field for ID proof
- Implement file upload service later as enhancement
- Consider cloud storage integration (AWS S3, Cloudinary)
- Implement proper file validation and security

### **Performance Considerations**

- Implement pagination for admission lists
- Use proper indexing for search queries
- Optimize PDF generation performance
- Consider caching strategies for course data
- Implement efficient filtering and search
