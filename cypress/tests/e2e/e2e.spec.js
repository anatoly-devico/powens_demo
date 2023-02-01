import {
  check_onboarding_breadcrumbs_steps, create_user_and_login,
  create_workspace,
  step_1_add_domain,
  step_2_configure_app,
  step_3_set_connectors,
  step_4_configure_webhooks, step_5_test_setup,
  submit_tell_us_about_your_company_modal,
} from "../../selectors/powens_console";

describe('e2e flow', () => {

  it('User should be able to: ' +
    'register, ' +
    'pass verification, ' +
    'log in, ' +
    'set company data,' +
    'create workspace, ' +
    'create app, ' +
    'add domain, ' +
    'configure app, ' +
    'set connectors, ' +
    'configure webhooks , ' +
    'test setup, ' +
    'receive webhooks', () => {

    create_user_and_login()
    submit_tell_us_about_your_company_modal()
    create_workspace()
    check_onboarding_breadcrumbs_steps()
    step_1_add_domain()
    step_2_configure_app()
    step_3_set_connectors()
    step_4_configure_webhooks()
    step_5_test_setup()
  })
})

