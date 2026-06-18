import { useMemo } from "react";
import requestAssessmentData from "./request-assessment.data";

export type FormType = {
  Id: string;
  Name: string;
  FocusArea?: string;
  TimeInMinutes?: string;
};

export type CompanyType = {
  Id: string;
  Name: string;
  Country: string;
  PrimaryContact?: {
    Name: string;
    Email: string;
    Phone?: string;
  };
  PlatformId?: string;
  IsActive: boolean;
};

export type FormDetailType = {
  FocusArea?: string;
  TimeInMinutes?: string;
};

export const Months = [
  { label: "Jan", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Apr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Aug", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

export const Years = [
  { label: "2000", value: "2000" },
  { label: "2001", value: "2001" },
  { label: "2002", value: "2002" },
  { label: "2003", value: "2003" },
  { label: "2004", value: "2004" },
  { label: "2005", value: "2005" },
  { label: "2006", value: "2006" },
  { label: "2007", value: "2007" },
  { label: "2008", value: "2008" },
  { label: "2009", value: "2009" },
  { label: "2010", value: "2010" },
  { label: "2011", value: "2011" },
  { label: "2012", value: "2012" },
  { label: "2013", value: "2013" },
  { label: "2014", value: "2014" },
  { label: "2015", value: "2015" },
  { label: "2016", value: "2016" },
  { label: "2017", value: "2017" },
  { label: "2018", value: "2018" },
  { label: "2019", value: "2019" },
  { label: "2020", value: "2020" },
  { label: "2021", value: "2021" },
  { label: "2022", value: "2022" },
  { label: "2023", value: "2023" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
];

export function useRequestAssessment() {
  //const { data, loading, error } = useGetFormFormDetailsCompanyListQuery();

  const formDetailList: FormDetailType[] = useMemo<FormDetailType[]>(() => {
    if (!requestAssessmentData) return [];
    if (!requestAssessmentData.FormDetails) return [];
    return requestAssessmentData.FormDetails;
  }, []);

  const formList: FormType[] = useMemo<FormType[]>(() => {
    if (!requestAssessmentData) return [];
    if (!requestAssessmentData.Form) return [];
    return requestAssessmentData.Form.map((form) => {
      return {
        Id: form.id,
        Name: form.name,
      };
    });
  }, []);

  const companyList: CompanyType[] = useMemo<CompanyType[]>(() => {
    if (!requestAssessmentData) return [];
    if (!requestAssessmentData.Company) return [];
    return requestAssessmentData.Company.map((company) => {
      return {
        Id: company.id,
        Name: company.name,
        Country: company.country,
        IsActive: company.isActive,
      };
    });
  }, []);

  type MonthYearProps = {
    Month: string;
    Year: string;
  };
  type ExistingCompanyFormFieldsType = {
    Company?: string[];
    Duration?: MonthYearProps[];
  };

  const validation = (data: ExistingCompanyFormFieldsType) => {};
  return { formList, companyList, Months, Years, validation };
}
