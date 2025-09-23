



export interface ServiceBilling {
    id: string;
    serviceIds: string[];
    total: number;
    billId: string;
    admissionId: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateServiceBilling {
    serviceIds: string[];
    total: number;
    admissionId: string;
}

export interface UpdateServiceBilling {
    serviceIds?: string[];
    total?: number;
    status?: "PENDING" | "PAID" | "CANCELLED";
    id: string;
}


export interface DeleteServiceBilling {
    id: string;
}


export interface ServiceBillingWithAdmission {
  id: string;
  serviceIds: string[];
  total: number;
  admissionId: string;
  createdAt: Date;
  billId: string;
  updatedAt: Date;
  status : "PENDING" | "PAID" | "CANCELLED";
  admission: {
    candidateName: string;
    admissionNumber: string;
  };
  services?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

