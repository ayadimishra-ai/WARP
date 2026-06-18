export interface IESGHealthAndSafetyLog {
  id?: string;
  op_organization_id?: string;
  user_id?: string;
  organization_address_id?: string;
  task_request_id?: string;
  activity_task_request_id?: string;
  workforce_category?: string;
  total_workforce_covered?: number;
  total_hours_worked?: number;
  fatalities_reported?: number;
  high_consequence_work_related_injuries_reported?: number;
  total_recordable_injuries?: number;
  lost_time_injuries?: number;
  near_misses_reported?: number;
  lost_workdays_due_to_injury?: number;
  workforce_type?: string;
  number_of_first_aid_incidents?: number;
  medical_treatment_incidents?: number;
  number_of_people_benefitted_from_regular_health_checkups?: number;
  total_man_hours_worked?: number;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
  env?: string;
  isdeleted: boolean;
}

export interface IESGSafetyObservationLog {
  id: string | null;
  op_organization_id: string | null;
  user_id: string | null;
  organization_address_id: string | null;
  task_request_id: string | null;
  activity_task_request_id: string | null;
  total_safety_observations_reported: string | null;
  new_safety_observations_reported: number | null;
  total_safety_observations_closed_resolved: number | null;
  corrective_actions_closed: number | null;
  number_of_mock_drills_conducted: number | null;
  number_of_fire_incidents_reported: number | null;
  unsafe_acts_behaviour_observations_reported: number | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  updated_by: string | null;
  env: string | null;
  isdeleted: boolean;
}

export interface IESGHealthAndSafetyTrainingLog {
  id?: string;
  op_organization_id?: string;
  user_id?: string;
  organization_address_id?: string;
  task_request_id?: string;
  activity_task_request_id?: string;
  type_of_workforce_trained?: string;
  category_of_workforce_trained?: string;
  training_type?: string;
  training_category?: string;
  number_of_workforce_trained?: string;
  total_training_hours?: number;
  agency?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
  env?: string;
  isdeleted: boolean;
}
