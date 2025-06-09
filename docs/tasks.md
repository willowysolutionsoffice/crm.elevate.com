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

- [ ] **UI/UX Testing**
  - [ ] Test responsive design on different screen sizes
  - [ ] Verify form validations work correctly
  - [ ] Test navigation and user flows

### **Task 10: Documentation and Deployment**

- [ ] **Code Documentation**

  - [ ] Add JSDoc comments to all functions
  - [ ] Document API endpoints
  - [ ] Update README if needed

- [ ] **Database Seeding**
  - [ ] Add sample invoice data to `prisma/seed.ts`
  - [ ] Include test invoice items for development

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
