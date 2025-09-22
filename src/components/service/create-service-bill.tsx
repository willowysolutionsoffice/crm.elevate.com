import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import {
  listStudents,
  listServices,
  createServiceBilling,
} from "@/server/actions/service-actions";

interface Student {
  id: string;
  candidateName: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

const serviceBillSchema = z.object({
  admissionId: z.string().min(1, "Student selection is required"),
  serviceIds: z
    .array(z.string())
    .min(1, "At least one service must be selected"),
});

type ServiceBillForm = z.infer<typeof serviceBillSchema>;

interface CreateServiceBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateServiceBillModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateServiceBillModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceBillForm = useForm<ServiceBillForm>({
    resolver: zodResolver(serviceBillSchema),
    defaultValues: {
      admissionId: "",
      serviceIds: [],
    },
  });

  const loadFormData = async () => {
    try {
      const [studentsResult, servicesResult] = await Promise.all([
        listStudents(),
        listServices(),
      ]);

      if (studentsResult.success) {
        setStudents(studentsResult.data);
      }
      if (servicesResult.success) {
        setServices(servicesResult.data);
      }
    } catch (error) {
      console.error("Failed to load form data", error);
      toast.error("Failed to load form data");
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedServices, serviceId]
      : selectedServices.filter((id) => id !== serviceId);

    setSelectedServices(newSelection);
    serviceBillForm.setValue("serviceIds", newSelection);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleCreateServiceBill = async (data: ServiceBillForm) => {
    setIsSubmitting(true);
    try {
      if (
        selectedServices.length <= 0 ||
        !data.serviceIds ||
        data.serviceIds.length === 0 ||
        data.admissionId === "all" ||
        data.admissionId.trim() === ""
      ) {
        toast.error("At least one service must be selected");
        return;
      }
      const total = calculateTotal();
      const result = await createServiceBilling({
        ...data,
        total,
      });

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        serviceBillForm.reset();
        setSelectedServices([]);
        onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to create service bill", error);
      toast.error("Failed to create service bill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    serviceBillForm.reset();
    setSelectedServices([]);
  };

  // Load form data when dialog opens
  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Service Bill</DialogTitle>
          <DialogDescription>
            Create a new service bill for a student with selected services
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={serviceBillForm.handleSubmit(handleCreateServiceBill)}
          className="space-y-6"
        >
          {/* Student Selection */}
          <div className="space-y-2">
            <Label htmlFor="student-select">Select Student</Label>
            <Select
              value={serviceBillForm.watch("admissionId")}
              onValueChange={(value) =>
                serviceBillForm.setValue("admissionId", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Loading students...
                  </SelectItem>
                ) : (
                  students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.candidateName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {serviceBillForm.formState.errors.admissionId && (
              <p className="text-sm text-destructive">
                {serviceBillForm.formState.errors.admissionId.message}
              </p>
            )}
          </div>

          {/* Services Selection */}
          <div className="space-y-2">
            <Label>Select Services</Label>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-3">
              {services.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Loading services...
                </p>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between space-x-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={(checked) =>
                          handleServiceToggle(service.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={service.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {service.name}
                      </Label>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(service.price)}
                    </div>
                  </div>
                ))
              )}
            </div>
            {serviceBillForm.formState.errors.serviceIds && (
              <p className="text-sm text-destructive">
                {serviceBillForm.formState.errors.serviceIds.message}
              </p>
            )}
          </div>

          {/* Bill Summary */}
          {selectedServices.length > 0 && (
            <div className="border rounded-md p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Bill Summary</h4>
              <div className="space-y-2 text-sm">
                {selectedServices.map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  return service ? (
                    <div key={serviceId} className="flex justify-between">
                      <span>{service.name}</span>
                      <span>{formatCurrency(service.price)}</span>
                    </div>
                  ) : null;
                })}
                <hr className="my-2" />
                <div className="flex justify-between font-medium text-base">
                  <span>Total Amount</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Service Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}