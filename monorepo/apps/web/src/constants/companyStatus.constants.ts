export const COMPANY_STATUS = {
    CREATED: 'CREATED' as const,
    OTHER: 'OTHER' as const
} as const;

export type CompanyStatus = typeof COMPANY_STATUS[keyof typeof COMPANY_STATUS];

export default COMPANY_STATUS;
