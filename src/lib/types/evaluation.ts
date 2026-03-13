export interface VTAEvaluation {
  id: string;
  submission_id: string;
  eval_config: string;
  evaluate_after: string;
  repo: string;
  branch: string;
  setup_data_url: string;
  submission_url: string;
  facility: string | null;
  student_username: string;
  student_email: string;
  status: string;
  created_date: string | null;
  modified_date: string | null;
}
