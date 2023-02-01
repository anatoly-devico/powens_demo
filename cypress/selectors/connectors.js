export const connect_modal = {
  first_step_title: `app-flow-stepper > div:nth-child(1)`,
  second_step_title: `app-flow-stepper > div:nth-child(2)`,
  third_step_title: `app-flow-stepper > div:nth-child(3)`,
  terms_of_use_title: '.content-header > p',
  accept_terms_of_use_btn: 'div > .button-primary',
  main_content_terms_of_use: '[class="content-main"]',

  institution_select: {
    search_field: "[name='filter']",
    list_items: '[class="sublist"] > li > span'
  },
  credentials: {
    particuliers: `ul > li:nth-child(1)`,
    login_field: "[type='text']",
    password_field: "[type='password']",
    log_in_btn: ".content-footer > .button-primary"
  },
  account_select: {
    header: '[class="content-header"] > h2',
    second_checkbox: 'li:nth-of-type(2) > .select-indicator',
    finish_btn: '[class="next-source-prompt"] > :last-child',
    connect_more_accounts: '[class="next-source-prompt"] > :nth-child(2)'
  },
}