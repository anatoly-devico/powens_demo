import {email_helper} from '../helpers/email_helper.js';
import GuerrillaMailApi from 'guerrillamail-api';
import {get_random_string_number} from "../helpers/random_generator";

const GuerrillaApi = new GuerrillaMailApi({});

Cypress.Commands.add('sign_in', (email, password) => {
  if (!email && !password) {
    cy.log(`Creds for loging weren't provided. Login with default creds.`)
    email = Cypress.env('DEFAULT_EMAIL')
    password = Cypress.env('DEFAULT_PASSWORD')
  }
  return cy.request({
    method: 'POST',
    url: `https://meta.biapi.pro/auth2/login`,
    headers: {
      'content-type': 'application/json',
    },
    body: {
      email: email,
      password: password
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.log('user entity:')
    cy.log(response)
    Cypress.env('USER_ENTITY', response)
    window.localStorage.setItem('preferredLang', 'en-gb');
    window.localStorage.setItem('token', response.body.access_token);
    window.localStorage.setItem('tokenExpiration', response.body.access_token_expiration);
    window.localStorage.setItem('refreshToken', response.body.refresh_token)
    window.localStorage.setItem('refreshTokenExpiration', response.body.refresh_token_expiration);
  })
})

Cypress.Commands.add('sign_up', () => {
  cy.intercept('POST', 'https://meta.biapi.pro/auth2/register/verify-email').as('verification_request')
  const email = email_helper.get_uniq_email();
  const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
  const first_name = "Cypress";
  const last_name = `Dude${get_random_string_number(5)}`

  cy.request({
    method: 'POST',
    url: `https://meta.biapi.pro/auth2/register`,
    headers: {
      'content-type': 'application/json',
    },
    body: {
      email: email,
      password1: password,
      password2: password,
      first_name: first_name,
      last_name: last_name
    },
  }).then((response) => {
    expect(response.status).to.eq(201);
    cy.log(response.detail)
  })

  email_helper.email_pool(email, 'Activate your Powens account').then((resp) => {
    cy.visit(email_helper.get_activation_link(resp))
  })
  cy.wait('@verification_request').its('response.body.results.detail').should('eq', "ok")

  return cy.wrap({
    email: email,
    password: password,
    first_name: first_name,
    last_name: last_name
  }).as('user_creds')
})




