import * as z from "zod";
import { AccountType } from "./register.types";

const baseSchema = {
  email: z
    .string()
    .email("Endereco de e-mail invalido.")
    .min(1, "E-mail e obrigatorio."),
  challenge: z.string().optional(),
  password: z.string().min(6, "A senha deve ter no minimo 6 caracteres."),
};

const pfSchema = z.object({
  type: z.literal("PF"),
  document: z
    .string()
    .min(14, "CPF invalido. Use o formato xxx.xxx.xxx-xx")
    .max(14, "CPF invalido. Use o formato xxx.xxx.xxx-xx"),
  name: z.string().min(3, "Nome completo e obrigatorio"),
  ...baseSchema,
});

const pjSchema = z.object({
  type: z.literal("PJ"),
  document: z
    .string()
    .min(18, "CNPJ invalido. Use o formato xx.xxx.xxx/xxxx-xx")
    .max(18, "CNPJ invalido. Use o formato xx.xxx.xxx/xxxx-xx"),
  name: z.string().min(3, "Razao Social e obrigatoria"),
  ...baseSchema,
});

export type RegistrationFormValues =
  | z.infer<typeof pfSchema>
  | z.infer<typeof pjSchema>;

export function getRegisterSchema(accountType: AccountType) {
  return accountType === "PF" ? pfSchema : pjSchema;
}
