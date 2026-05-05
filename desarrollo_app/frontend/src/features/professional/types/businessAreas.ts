export const BUSINESS_AREA_OPTIONS = [
  { value: 'TECNOLOGIA_IT', label: 'Tecnología / IT' },
  { value: 'CIBERSEGURIDAD', label: 'Ciberseguridad' },
  { value: 'DATA_ANALYTICS', label: 'Data & Analytics' },
  { value: 'INTELIGENCIA_ARTIFICIAL', label: 'Inteligencia Artificial' },
  { value: 'INGENIERIA', label: 'Ingeniería' },
  { value: 'TELECOMUNICACIONES', label: 'Telecomunicaciones' },
  { value: 'FINANZAS', label: 'Finanzas' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal & Compliance' },
  { value: 'RECURSOS_HUMANOS', label: 'Recursos Humanos' },
  { value: 'MARKETING_VENTAS', label: 'Marketing & Ventas' },
  { value: 'OPERACIONES', label: 'Operaciones' },
  { value: 'CONSULTORIA', label: 'Consultoría' },
  { value: 'PRODUCTO', label: 'Producto' },
  { value: 'SUPPLY_CHAIN_LOGISTICA', label: 'Supply Chain / Logística' },
  { value: 'ENERGIA', label: 'Energía' },
  { value: 'SALUD_FARMA', label: 'Salud / Farma' },
  { value: 'RETAIL_ECOMMERCE', label: 'Retail / E-commerce' },
  { value: 'CONSTRUCCION_INFRAESTRUCTURA', label: 'Construcción / Infraestructura' },
  { value: 'SECTOR_PUBLICO', label: 'Sector Público' },
] as const;

export type BusinessAreaValue = (typeof BUSINESS_AREA_OPTIONS)[number]['value'];

export function getBusinessAreaLabel(value: string): string {
  return BUSINESS_AREA_OPTIONS.find((option) => option.value === value)?.label ?? value;
}