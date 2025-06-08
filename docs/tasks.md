# Invoice Generator Feature Implementation Tasks

This document outlines the comprehensive tasks required to implement an invoice generator feature within an existing Next.js CRM application. The tasks are presented in a story point view with checkboxes for easy tracking and completion by an AI coding agent.

## Prerequisites

- [ ] **pdfme Documentation Reference**: Use Context7 MCP for latest pdfme documentation: `/pdfme/pdfme`
- [ ] **Package Management**: Always use PNPM as package manager (`pnpm add`, `pnpm dlx`)
- [ ] **Database Operations**: Use Prisma MCP for all database-related operations
- [ ] **TypeScript Types**: Follow project rule - ALL interfaces/types MUST be in `@/types/` folder

## Story Point: Add a new feature: Invoices

### **Task 1: Database Schema Setup (Prisma)**

- [ ] **Define Invoice Model in Prisma Schema**

  - [ ] Add `Invoice` model to `prisma/schema.prisma` with fields:
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

- [ ] **Define InvoiceItem Model in Prisma Schema**

  - [ ] Add `InvoiceItem` model to `prisma/schema.prisma` with fields:
    - `id` (String, @id, @default(auto()), @map("\_id"), @db.ObjectId)
    - `invoiceId` (String, @db.ObjectId, foreign key to Invoice)
    - `invoice` (Invoice relation)
    - `itemDescription` (String)
    - `quantity` (Int)
    - `unitPrice` (Float)
    - `lineTotal` (Float)
    - `createdAt` (DateTime, @default(now()))
    - `updatedAt` (DateTime, @updatedAt)

- [ ] **Create TypeScript Types**

  - [ ] Create `@/types/invoice.ts` with interfaces:
    - `Invoice` interface matching Prisma model
    - `InvoiceItem` interface matching Prisma model
    - `InvoiceStatus` enum
    - `CreateInvoiceInput` type
    - `UpdateInvoiceInput` type
    - `InvoiceFormData` type for forms

- [ ] **Run Prisma Migration**
  - [ ] Use Prisma MCP: `migrate-dev` with descriptive name: "add_invoice_models"
  - [ ] Verify schema update with `migrate-status`

### **Task 2: Invoice Actions Setup**

- [ ] **Create Invoice Server Actions**
  - [ ] Create `src/app/actions/invoice-actions.ts` following existing patterns from `enquiry-action.ts`
  - [ ] Implement server actions:
    - `createInvoice()` - Create new invoice with auto-generated invoice number
    - `updateInvoice()` - Update existing invoice
    - `deleteInvoice()` - Soft delete invoice
    - `getInvoices()` - Fetch all invoices with pagination
    - `getInvoiceById()` - Fetch single invoice with items
    - `addInvoiceItem()` - Add item to invoice
    - `updateInvoiceItem()` - Update invoice item
    - `deleteInvoiceItem()` - Remove item from invoice
    - `calculateInvoiceTotals()` - Recalculate invoice totals

### **Task 3: Invoice Data Table View (Shadcn UI)**

- [ ] **Create Invoice List Page**

  - [ ] Create `src/app/(sidebar)/invoices/page.tsx`
  - [ ] Follow existing pattern from `src/app/(sidebar)/enquiries/page.tsx`
  - [ ] Implement data table using Shadcn UI components:
    - Use `@tanstack/react-table` (already in dependencies)
    - Display columns: Invoice Number, Billed To, Date, Status, Total Amount
    - Add search/filter functionality
    - Include pagination

- [ ] **Create Invoice Table Component**

  - [ ] Create `src/components/invoice/invoices-table.tsx`
  - [ ] Follow pattern from existing table components
  - [ ] Include action buttons for View, Edit, Delete, Generate PDF
  - [ ] Add status badges with proper styling

### **Task 4: New Invoice Creation Dialog Form**

- [ ] **Create Invoice Form Dialog**

  - [ ] Create `src/components/invoice/invoice-form-dialog.tsx`
  - [ ] Follow pattern from `src/components/enquiry/enquiry-form-dialog.tsx`
  - [ ] Include form fields:
    - `billedTo` (textarea for client details)
    - `invoiceNumber` (read-only, auto-generated)
    - `invoiceDate` (date picker, default to today)
    - `dueDate` (date picker, optional)
    - `notes` (textarea, optional)
  - [ ] Use `react-hook-form` with `zod` validation
  - [ ] Implement proper error handling and success toast

- [ ] **Create Delete Invoice Dialog**
  - [ ] Create `src/components/invoice/delete-invoice-dialog.tsx`
  - [ ] Follow pattern from existing delete dialogs
  - [ ] Include confirmation and soft delete functionality

### **Task 5: Invoice Detail Page**

- [ ] **Create Dynamic Invoice Detail Page**

  - [ ] Create `src/app/(sidebar)/invoices/[id]/page.tsx`
  - [ ] Follow pattern from `src/app/(sidebar)/enquiries/[id]/page.tsx`
  - [ ] Display invoice header information (Billed To, Invoice Number, Date)
  - [ ] Include editable invoice metadata

- [ ] **Create Invoice Items Management**

  - [ ] Create `src/components/invoice/invoice-items-section.tsx`
  - [ ] Implement dynamic items table with:
    - Add/Remove item rows
    - Item Description, Quantity, Unit Price fields
    - Auto-calculated Line Total (quantity × unitPrice)
    - Real-time subtotal calculation
  - [ ] Use optimistic updates for better UX

- [ ] **Create Invoice Totals Display**
  - [ ] Create `src/components/invoice/invoice-totals.tsx`
  - [ ] Display calculated totals:
    - Subtotal (sum of all line totals)
    - Tax Amount (configurable tax rate, default 18% GST)
    - Total Amount (Subtotal + Tax)
  - [ ] Auto-update when items change

### **Task 6: PDF Generation Setup**

- [ ] **Install pdfme Dependencies**

  - [ ] Install required packages: `pnpm add @pdfme/generator @pdfme/common @pdfme/schemas`
  - [ ] Reference pdfme documentation via Context7 MCP for latest API patterns

- [ ] **Create PDF Service**
  - [ ] Create `src/lib/pdf-service.ts`
  - [ ] Implement PDF generation functions:
    - `generateInvoicePDF(invoiceId: string)` - Generate PDF from invoice data
    - `mapInvoiceDataToTemplate(invoice, items)` - Map database data to template format
  - [ ] Follow server-side generation patterns from pdfme docs

### **Task 7: Invoice PDF Template Integration**

- [ ] **Analyze Existing Template**

  - [ ] Study `/public/pdf/invoice_template.json` structure
  - [ ] Understand template fields mapping:
    - `billedToInput` → invoice.billedTo
    - `info.InvoiceNo` → invoice.invoiceNumber
    - `info.Date` → invoice.invoiceDate
    - `orders` → invoiceItems array
    - `taxInput.rate` → invoice.taxRate
    - Dynamic calculations for totals

- [ ] **Implement Template Data Mapping**
  - [ ] Create `src/lib/invoice-template-mapper.ts`
  - [ ] Map invoice data to template format:
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

### **Task 8: Generate Invoice PDF Feature**

- [ ] **Create PDF Generation API Route**

  - [ ] Create `src/app/api/invoices/[id]/pdf/route.ts`
  - [ ] Implement PDF generation endpoint
  - [ ] Return PDF as downloadable file with proper headers

- [ ] **Add PDF Generation UI**

  - [ ] Add "Generate PDF" button to invoice detail page
  - [ ] Add "Download PDF" action to invoices table
  - [ ] Implement proper loading states and error handling
  - [ ] Show PDF preview option (using pdfme viewer if needed)

- [ ] **Enhance User Experience**
  - [ ] Add PDF generation status feedback
  - [ ] Implement client-side PDF preview
  - [ ] Add option to email PDF (future enhancement)

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
