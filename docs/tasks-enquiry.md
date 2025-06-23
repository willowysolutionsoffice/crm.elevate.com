# Enquiry Module Enhancement - Implementation To-Do List

Step-by-step tasks to implement activity tracking and status management improvements.

## Prerequisites Checklist

- [ ] Verify PNPM is installed and configured
- [ ] Confirm Prisma MCP is available for database operations
- [ ] Check shadcn/ui components are set up
- [ ] Ensure Next.js 15 server actions are working

---

## Phase 1: Database Schema Setup (2 hours)

### Task 1.1: Create Activity Tracking Schema

- [ ] Open `prisma/schema.prisma`
- [ ] Add `ActivityType` enum with values: `STATUS_CHANGE`, `FOLLOW_UP`, `CALL_LOG`, `ENROLLMENT_DIRECT`
- [ ] Create `EnquiryActivity` model with:
  - [ ] `id` (ObjectId, primary key)
  - [ ] `enquiryId` (ObjectId, foreign key)
  - [ ] `type` (ActivityType enum)
  - [ ] `title` (String)
  - [ ] `description` (String, optional)
  - [ ] `previousStatus` (EnquiryStatus, optional)
  - [ ] `newStatus` (EnquiryStatus, optional)
  - [ ] `statusRemarks` (String, optional)
  - [ ] `followUpId` (ObjectId, optional)
  - [ ] `callLogId` (ObjectId, optional)
  - [ ] `createdByUserId` (String)
  - [ ] `createdAt` (DateTime)
  - [ ] Relations to `Enquiry`, `User`, `FollowUp`, `CallLog`

### Task 1.2: Update Existing Models

- [ ] Add `activities` relation to `Enquiry` model
- [ ] Add `createdEnquiryActivities` relation to `User` model
- [ ] Add `activities` relation to `FollowUp` model
- [ ] Add `activities` relation to `CallLog` model

### Task 1.3: Run Database Migration

- [ ] Run `pnpm dlx prisma migrate dev --name add-activity-tracking`
- [ ] Verify migration files are created in `prisma/migrations/`
- [ ] Check database schema is updated correctly
- [ ] Run `pnpm dlx prisma generate` to update Prisma Client

---

## Phase 2: TypeScript Types (30 minutes)

### Task 2.1: Create Activity Types

- [ ] Create `src/types/enquiry-activity.ts`
- [ ] Define `EnquiryActivity` interface
- [ ] Define `ActivityType` enum
- [ ] Export `CreateActivityInput` interface
- [ ] Export `ActivityFilters` interface

### Task 2.2: Update Existing Types

- [ ] Update `src/types/enquiry.ts` to include `activities` relation
- [ ] Update `src/types/user.ts` to include activity relations
- [ ] Verify all types compile without errors

---

## Phase 3: Server Actions (3 hours)

### Task 3.1: Enhanced Status Update Actions

- [ ] Open `src/server/actions/enquiry.ts`
- [ ] Create `updateEnquiryStatusWithActivity` function:
  - [ ] Get current user with `getCurrentUser()`
  - [ ] Fetch existing enquiry to get current status
  - [ ] Implement role-based access control
  - [ ] Use Prisma transaction to:
    - [ ] Update enquiry status and lastContactDate
    - [ ] Create activity record with status change details
  - [ ] Add proper error handling
  - [ ] Include `revalidatePath` calls

### Task 3.2: Direct Enrollment Function

- [ ] Create `updateEnquiryStatusDirectToEnrolled` function
- [ ] Handle direct enrollment without admission form
- [ ] Create `ENROLLMENT_DIRECT` activity type entry
- [ ] Add proper validation and error handling

### Task 3.3: Activity Fetching Actions

- [ ] Create `src/server/actions/enquiry-activity.ts`
- [ ] Implement `getEnquiryActivities` function:
  - [ ] Fetch activities for specific enquiry
  - [ ] Include relations (createdBy, followUp, callLog)
  - [ ] Order by createdAt descending
  - [ ] Add proper error handling

### Task 3.4: Update Existing Actions

- [ ] Update `createFollowUp` in `src/server/actions/follow-up.ts`:
  - [ ] Add activity logging in transaction
  - [ ] Create `FOLLOW_UP` activity entry
- [ ] Update `createCallLog` in `src/server/actions/call-log.ts`:
  - [ ] Add activity logging in transaction
  - [ ] Create `CALL_LOG` activity entry

---

## Phase 4: Frontend Components (2 hours)

### Task 4.1: Status Update Dialog Component

- [ ] Create `src/components/enquiry/status-update-dialog.tsx`
- [ ] Design dialog with:
  - [ ] Status dropdown (current → new status)
  - [ ] Optional remarks textarea
  - [ ] "Direct Enrollment" checkbox for ENROLLED status
  - [ ] Submit and Cancel buttons
- [ ] Add form validation with Zod
- [ ] Implement loading states and error handling
- [ ] Use existing dialog patterns from call-log/follow-up dialogs

### Task 4.2: Update Enquiry Detail Page

- [ ] Open `src/app/(sidebar)/enquiries/[id]/page.tsx`
- [ ] Replace direct status dropdown with StatusUpdateDialog:
  - [ ] Find existing status select element
  - [ ] Replace with dialog trigger button
  - [ ] Add dialog component to page
- [ ] Update activity tab to fetch unified activities:
  - [ ] Call `getEnquiryActivities` server action
  - [ ] Merge with existing follow-ups and call logs
  - [ ] Sort chronologically (newest first)

### Task 4.3: Enhanced Activity Timeline

- [ ] Modify existing activity tab rendering:
  - [ ] Keep existing gradient card design
  - [ ] Add status change activity cards with blue color coding
  - [ ] Preserve follow-up (green) and call log (purple) styling
  - [ ] Add activity type icons (status change, phone, calendar)
  - [ ] Maintain responsive design
- [ ] Add activity filtering (optional):
  - [ ] Filter by activity type
  - [ ] Filter by date range

---

## Phase 5: Integration & Testing (1 hour)

### Task 5.1: Integration Testing

- [ ] Test status updates create activity entries
- [ ] Verify activity timeline displays correctly
- [ ] Test direct enrollment functionality
- [ ] Check follow-up and call log activity creation
- [ ] Validate role-based access control

### Task 5.2: UI/UX Testing

- [ ] Test responsive design on mobile/tablet
- [ ] Verify dialog interactions work properly
- [ ] Check loading states and error messages
- [ ] Test activity timeline scrolling and performance

### Task 5.3: Data Migration (if needed)

- [ ] Create script to generate initial activities for existing enquiries
- [ ] Test migration on development database
- [ ] Backup production data before migration

---

## Phase 6: Final Validation (30 minutes)

### Task 6.1: Code Review Checklist

- [ ] All TypeScript types are in `@/types/` folder
- [ ] Server actions follow existing patterns
- [ ] UI components match existing design system
- [ ] Error handling is comprehensive
- [ ] Performance considerations are addressed

### Task 6.2: Feature Validation

- [ ] ✅ Status changes are logged with context
- [ ] ✅ Unified activity timeline works
- [ ] ✅ Direct enrollment works without admission form
- [ ] ✅ Existing functionality remains unaffected
- [ ] ✅ Performance impact is minimal
- [ ] ✅ User experience is improved

---

## Deployment Checklist

### Pre-Deployment

- [ ] Run all tests pass
- [ ] Database migration is ready
- [ ] Backup current database
- [ ] Verify environment variables

### Deployment Steps

- [ ] Deploy database migration
- [ ] Deploy application code
- [ ] Verify activity tracking works
- [ ] Monitor for any errors
- [ ] Test core functionality

---

## Estimated Timeline

- **Phase 1**: Database Schema (2 hours)
- **Phase 2**: TypeScript Types (30 minutes)
- **Phase 3**: Server Actions (3 hours)
- **Phase 4**: Frontend Components (2 hours)
- **Phase 5**: Integration & Testing (1 hour)
- **Phase 6**: Final Validation (30 minutes)

**Total Development Time**: ~9 hours

---

## Success Criteria

- [ ] All status changes create audit trail entries
- [ ] Activity timeline shows unified view of all activities
- [ ] Direct enrollment works without admission form
- [ ] Existing functionality remains unaffected
- [ ] Performance impact is minimal
- [ ] User experience is improved
