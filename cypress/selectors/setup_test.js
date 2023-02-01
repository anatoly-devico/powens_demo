export const setup_test = {
  title: 'app-console-page-header > div > h1',
  link_your_bank_btn: 'app-step-connection-sync > button',
  get_access_token_btn: 'app-step-access-token > div > div > button',
  n_step_title(n) {
    return `div [class="steps-container"] > :nth-child(${n}) > .title-medium`
  },
  n_step_content(n) {
    return `div [class="steps-container"] > :nth-child(${n}) > .step-content > section`
  },
  step_3_title_line_1: 'section > app-step-data-from-webhook > :first-child',
  step_3_title_line_2: 'section > app-step-data-from-webhook > :nth-child(2)',
  copy_data_from_webhook_btn: 'app-step-data-from-webhook > app-code-snippet > div > app-copy',
  webhook_data_json_text: 'app-step-data-from-webhook > app-code-snippet > div > ng-scrollbar > div > div > div > div > pre',
  congrats_text_line_1: '.success > div >:first-child',
  congrats_text_line_2: '.success > div >:nth-child(2)',
  visit_my_dashboard_btn: '.success > div > div > a > button'
}