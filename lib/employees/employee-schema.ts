import { z } from "zod";

export const employeeSchema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    document: z.string().min(1),
    documentType: z.enum(["CPF", "OTHER"]).optional().default("CPF"),
    documentTypeOther: z.string().nullable().optional(),
    roleName: z.string().optional(),
    salary: z.number().nonnegative(),
    regime: z.enum(["DIA", "QUINZENA", "MES"]),
    hoursPerDay: z.number().positive(),
    chargesPercent: z.number().nonnegative(),
    benefitsAmount: z.number().nonnegative(),
    isActive: z.boolean().optional(),
    bankName: z.string().nullable().optional(),
    bankAgency: z.string().nullable().optional(),
    bankAccount: z.string().nullable().optional(),
    bankAccountDigit: z.string().nullable().optional(),
    bankSwift: z.string().nullable().optional(),
    bankIban: z.string().nullable().optional(),
    pixKey: z.string().nullable().optional(),
    vtEnabled: z.boolean().optional(),
    nationality: z.string().nullable().optional(),
    birthDate: z.string().nullable().optional(),
    maritalStatus: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    number: z.string().nullable().optional(),
    neighborhood: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional(),
    rg: z.string().nullable().optional(),
    rgIssuer: z.string().nullable().optional(),
    ctps: z.string().nullable().optional(),
    pis: z.string().nullable().optional(),
    voterCardNumber: z.string().nullable().optional(),
    voterCardZone: z.string().nullable().optional(),
    voterCardSection: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.documentType === "CPF") {
      const digits = data.document.replace(/\D/g, "");
      if (digits.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["document"],
          message: "CPF deve conter 11 digitos.",
        });
      }
      return;
    }

    if (!data.documentTypeOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentTypeOther"],
        message: "Especifique o tipo de documento.",
      });
    }
  });

export const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  document: true,
  documentType: true,
  documentTypeOther: true,
  roleName: true,
  salary: true,
  regime: true,
  hoursPerDay: true,
  chargesPercent: true,
  benefitsAmount: true,
  isActive: true,
  bankName: true,
  bankAgency: true,
  bankAccount: true,
  bankAccountDigit: true,
  bankSwift: true,
  bankIban: true,
  pixKey: true,
  vtEnabled: true,
  nationality: true,
  birthDate: true,
  maritalStatus: true,
  phone: true,
  street: true,
  number: true,
  neighborhood: true,
  city: true,
  zipCode: true,
  rg: true,
  rgIssuer: true,
  ctps: true,
  pis: true,
  voterCardNumber: true,
  voterCardZone: true,
  voterCardSection: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function mapEmployeeWriteData(payload: z.infer<typeof employeeSchema>) {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    document:
      payload.documentType === "CPF"
        ? payload.document.replace(/\D/g, "")
        : payload.document.trim(),
    documentType: payload.documentType ?? "CPF",
    documentTypeOther:
      payload.documentType === "OTHER" ? payload.documentTypeOther?.trim() || null : null,
    roleName: payload.roleName,
    salary: payload.salary,
    regime: payload.regime,
    hoursPerDay: payload.hoursPerDay,
    chargesPercent: payload.chargesPercent,
    benefitsAmount: payload.benefitsAmount,
    isActive: payload.isActive ?? true,
    bankName: payload.bankName || null,
    bankAgency: payload.bankAgency || null,
    bankAccount: payload.bankAccount || null,
    bankAccountDigit: payload.bankAccountDigit || null,
    bankSwift: payload.bankSwift || null,
    bankIban: payload.bankIban || null,
    pixKey: payload.pixKey || null,
    vtEnabled: payload.vtEnabled ?? false,
    nationality: payload.nationality || null,
    birthDate: payload.birthDate || null,
    maritalStatus: payload.maritalStatus || null,
    phone: payload.phone || null,
    street: payload.street || null,
    number: payload.number || null,
    neighborhood: payload.neighborhood || null,
    city: payload.city || null,
    zipCode: payload.zipCode || null,
    rg: payload.rg || null,
    rgIssuer: payload.rgIssuer || null,
    ctps: payload.ctps || null,
    pis: payload.pis || null,
    voterCardNumber: payload.voterCardNumber || null,
    voterCardZone: payload.voterCardZone || null,
    voterCardSection: payload.voterCardSection || null,
  };
}
