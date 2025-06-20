import { PaymentsTable } from "@/components/payments/payments-table";
import { PaymentFormDialog } from "@/components/payments/payment-form-dialog";
import { getAdmissionWithFeeDetails } from "@/app/actions/fee-collection-actions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { PaymentsPageSkeleton } from "@/components/payments/payments-skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function Payments({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<PaymentsPageSkeleton />}>
        <PaymentsContent id={id} />
      </Suspense>
    </div>
  );
}

async function PaymentsContent({ id }: { id: string }) {
  const { data, error } = await getAdmissionWithFeeDetails(id);

  if (error) {
    return <div className="p-4">Error: {error}</div>;
  }

  if (!data) {
    return <div className="p-4">No data found</div>;
  }

  const { admission, feeDetails } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Payments for {admission.candidateName}
        </h1>
        <PaymentFormDialog
          admissionId={id}
          course={admission.course}
          feeDetails={feeDetails}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fee</CardDescription>
            <CardTitle>{formatCurrency(feeDetails.totalFee)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Paid</CardDescription>
            <CardTitle>{formatCurrency(feeDetails.totalPaid)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Balance</CardDescription>
            <CardTitle>{formatCurrency(feeDetails.balance)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Due Date</CardDescription>
            <CardTitle>
              {feeDetails.nextDueDate
                ? formatDate(feeDetails.nextDueDate)
                : "Not set"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Breakdown</CardTitle>
          <CardDescription>
            Detailed breakdown of fees and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Admission Fee</p>
              <p className="text-2xl font-bold">
                {formatCurrency(feeDetails.admissionFee)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Course Fee</p>
              <p className="text-2xl font-bold">
                {formatCurrency(feeDetails.courseFee)}
              </p>
            </div>
            {feeDetails.semesterFee && (
              <div>
                <p className="text-sm font-medium">Semester Fee</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(feeDetails.semesterFee)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <PaymentsTable admission={admission} feeDetails={feeDetails} />
      </div>
    </div>
  );
}
