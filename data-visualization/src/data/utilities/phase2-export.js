export const total_project_count_query = (path_to_data) => `
  select count(*) as c
  from '${path_to_data}private/AAP2_submission_metadata.csv'
`

export const researchers_query = (path_to_data) => ``

export const researcher_by_keywords_query = (path_to_data) => ``
