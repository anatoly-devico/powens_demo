import {create_organisation} from "../helpers/organisations_helper";
import {domains, edit_domain_window} from "./domains";
import {breadcrumbs_data} from "../fixtures/app_breadcrumbs_steps_data";
import {get_random_string_number} from "../helpers/random_generator";
import {applications, new_client_application_modal} from "./applications";
import {bank} from "./bank";
import {
  enable_webhook,
  get_creds_for_webhook_handling,
  set_webhook_email, wait_for_target_webhook
} from "../helpers/webhook_helper";
import {webhooks_ids} from "../fixtures/webhooks";
import {setup_test} from "./setup_test";
import {connect_modal} from "./connectors";
let token;
export const console_URL = 'https://console.budget-insight.com/';
export const powens_console = {
  home_btn: '[class="nav-element first active"]',
}

export const create_org_modal = {
  header: 'section h1',
  company_name_fld: '#input-text-name',
  country_dropdown: `[name='country'] .collapsed`,
  company_size_dropdown: `[name='size'] .collapsed`,
  activity_area_dropdown: `app-select:nth-of-type(2)`,
  dropdown_item(index) {
    return `.select-items > div:nth-of-type(${index})`
  },
  company_logo_text: '[class="column"] > div > label',
  upload_img_btn: '[class="column"] > div > app-input-file',
  save_btn: '[class=button]'
}

export const app_breadcrumb_steps = {
  welcome_header_text: 'header .title-large',
  text_below_welcome_header: 'header .regular',
  card: {
    number(n) {
      return `.steps > div:nth-of-type(${n}) > .semi-bold`
    },
    text(n) {
      return `.steps > div:nth-of-type(${n}) > p`
    },
    start_button(n) {
      return `.steps > div:nth-of-type(${n}) .small.button`
    }
  }
}

export function create_user_and_login(){
  cy.sign_up().then(creds => {
    cy.sign_in(creds.email, creds.password).then(resp => {
      token = Cypress.env('USER_ENTITY').body.access_token
    })
  })
}

export function submit_tell_us_about_your_company_modal(company_name = 'SRT', country_dropdown_index = 1, company_size_dropdown_index = 1, activity_area_dropdown_index = 1) {
  cy.visit(console_URL)
  create_organisation()
  cy.visit(console_URL)
}

export function create_workspace(name = 'test_workspace') {
  cy.get(domains.add_workspace_btn).click()
  cy.get(domains.add_workspace_modal.title).should('be.visible').and('contains.text', 'Add workspace')
  cy.get(domains.add_workspace_modal.add_btn).should('be.disabled')
  cy.get(domains.add_workspace_modal.name_fld).type(name)
  cy.get(domains.add_workspace_modal.add_btn).should('be.enabled').click()
}

export function check_onboarding_breadcrumbs_steps(currently_active_step = 1) {
  breadcrumbs_data.forEach((title, n) => {
    cy.get(app_breadcrumb_steps.card.number(n)).should('have.text', n)
    cy.get(app_breadcrumb_steps.card.text(n)).should('have.text', title)
    if (currently_active_step === n)
      cy.get(app_breadcrumb_steps.card.start_button(n)).should('be.enabled')
  });
}

export function step_1_add_domain(domain_name = `autotestdomain${get_random_string_number(5)}`) {
  cy.wrap(domain_name).as('domain_name')
  cy.intercept('POST', 'https://meta.biapi.pro/domains').as('creating_domain_request')
  cy.get(domains.add_domain_btn).should('be.visible').and('be.enabled').click()
  cy.get(edit_domain_window.add_btn).should('be.visible').and('be.disabled')
  cy.get(edit_domain_window.domain_name_fld).type(domain_name)
  cy.get(edit_domain_window.add_btn).should('be.visible').and('be.enabled').click()
  cy.wait('@creating_domain_request').then((response) => {
    cy.wrap(response.response.body.id).as('domain_id')
  })
  cy.get(domains.loading_btn).should('not.exist')
}

export function step_2_configure_app(app_name = 'autoApp') {
  cy.wrap(app_name).as('app_name')
  cy.intercept('POST', `https://meta.biapi.pro/domains/*/clients`).as('app_creating_request')
  cy.get(applications.loading_icon).should('not.exist')
  cy.get(domains.domain_title).should('be.visible')
  cy.get(app_breadcrumb_steps.card.start_button(2)).should('be.enabled').click()
  cy.get(applications.add_an_application_btn).should('be.enabled').click()
  cy.get(new_client_application_modal.save_btn).should('be.disabled')
  cy.get(new_client_application_modal.name_fld).type(app_name)
  cy.get(new_client_application_modal.save_btn).should('be.disabled')
  cy.get(new_client_application_modal.redirect_URIs_fld).type('https://demo.biapi.pro/2.0/banks/338178e6-3d01-564f-9a7b-52ca442459bf')
  cy.get(new_client_application_modal.save_btn).should('be.enabled').click()
  cy.wait('@app_creating_request')
  cy.get(new_client_application_modal.loading_icon).should('not.exist')
}

export function step_3_set_connectors() {
  cy.intercept('GET', 'https://meta.biapi.pro/domains/*/connectors?**').as('fetch_connectors')
  cy.get(app_breadcrumb_steps.card.start_button(3)).should('be.visible').click()
  cy.get(bank.loading_state).should('not.exist')
}

export function step_4_configure_webhooks() {
  cy.get(domains.loading_icon).should('not.exist')
  cy.get(app_breadcrumb_steps.card.start_button(4)).should('be.visible').click()
  cy.get('@domain_id').then((domain_id) => {
    get_creds_for_webhook_handling().then(creds_obj => {
      cy.wrap(creds_obj).as('webhook_handling_creds')
      set_webhook_email(creds_obj.email, domain_id, token)
      webhooks_ids.forEach(((webhook_id, webhook_event) => {
        cy.log(`Setting callback URL for ${webhook_event} webhook`)
        enable_webhook(webhook_id, webhook_event, creds_obj.url, domain_id, token)
      }))
    })
  })
  cy.reload()
}

export function step_5_test_setup() {
  cy.intercept('GET', 'https://meta.biapi.pro/domains/*/connectors?**').as('get_connectors')
  cy.get(domains.loading_icon).should('not.exist')
  cy.get(app_breadcrumb_steps.card.start_button(5)).scrollIntoView().should('be.visible').click()
  cy.get(setup_test.title).should('be.visible').and('contain.text', 'Test your setup')
  cy.get(setup_test.n_step_title(1)).should('be.visible').and('contain.text', 'Add a bank connection')
  cy.get(setup_test.n_step_content(1)).should('be.visible').and('contain.text', `1. Select a bank 2. Enter your credentials 3. Link your accounts Link your bank`)
  cy.wait('@get_connectors')
  cy.get(setup_test.link_your_bank_btn).should('be.visible').and('be.enabled').click()
  cy.get('@domain_name').then(domain => {
      cy.get('@app_name').then(app_name => {
        cy.origin(`https://${domain}-sandbox.biapi.pro`, {args: {app_name, connect_modal}}, ({app_name, connect_modal}) => {
          //step 1
          cy.get(connect_modal.terms_of_use_title).should('have.text', `${app_name} partners with Powens to connect your accounts`)
          cy.get(connect_modal.first_step_title).should('be.visible').and('contains.text', 'Institution selection')
          cy.get(connect_modal.main_content_terms_of_use).should('contain.text', '\n    \nConfidentialityPowens (Budget Insight) is regulated by the ACPR and Banque de France. Only Powens has access to your credentials and has the responsibility to protect them. autoApp will not have access to your credentials.\n    \nSecurityFor maximized security, your data is end-to-end encrypted and stored in the European Union.+ Learn more')
          cy.get(connect_modal.accept_terms_of_use_btn).should('be.visible').click()
          // step 2
          cy.get(connect_modal.second_step_title).should('be.visible').and('contains.text', 'Credentials')
          cy.get(connect_modal.institution_select.search_field).type('test')
          cy.get(connect_modal.institution_select.list_items).eq(0).should('be.visible').and('contains.text', 'Connecteur de test').click()
          cy.get(connect_modal.credentials.particuliers).should('be.visible').and('contains.text', 'Particuliers').click()
          cy.get(connect_modal.credentials.login_field).type('test_login')
          cy.get(connect_modal.credentials.password_field).type('1234')
          cy.get(connect_modal.credentials.log_in_btn).should('be.visible').and('be.enabled').click()
          // step 3
          cy.get(connect_modal.account_select.header).should('be.visible').and('contain.text', 'Select the accounts to usewith autoApp')
          cy.get(connect_modal.account_select.finish_btn).should('be.disabled')
          cy.get(connect_modal.account_select.second_checkbox).click({force: true})
          cy.get(connect_modal.account_select.finish_btn).should('be.enabled').click()
        })
      })
    }
  )
  cy.get(setup_test.n_step_content(2)).should('be.visible').and('contains.text', 'You successfully linked your accounts, now let\'s get a token to be able to call your API.')
  cy.get(setup_test.get_access_token_btn).should('be.visible').and('be.enabled').click()
  cy.get(setup_test.n_step_title(3)).should('be.visible').and('contains.text', "Loading your new connection's data")
  cy.get(setup_test.step_3_title_line_1).should('be.visible').and('contains.text', "Here's your previously added connection!")
  cy.get(setup_test.step_3_title_line_2).should('be.visible').and('contains.text', "This is the same data you would receive on a webhook of type CONNECTION_SYNCED.")
  cy.get('@user_creds').then(creds => {
    cy.get(setup_test.congrats_text_line_1).should('be.visible').and('contains.text', `Congrats, ${creds.first_name} ${creds.last_name}`)
  })
  cy.get(setup_test.congrats_text_line_2).should('be.visible').and('contains.text', `Your API is now ready for use!`)
  cy.get(setup_test.visit_my_dashboard_btn).should('be.visible').and('be.enabled')
  cy.get(setup_test.webhook_data_json_text).then(($obj) => {
    const expected_webhook_data = $obj.text()
    cy.log('expected_webhook_data')
    cy.log(expected_webhook_data)
    cy.get('@webhook_handling_creds').then(creds => {
      wait_for_target_webhook(JSON.parse(expected_webhook_data), creds.uuid)
    })
  })
}
