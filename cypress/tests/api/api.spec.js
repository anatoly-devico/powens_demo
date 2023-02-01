import {email_helper} from "../../helpers/email_helper";
import {get_random_string_number} from "../../helpers/random_generator";

describe('API tests for /auth2/register', () => {

  it('User should not be able to register without providing email', () => {
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`

    request_auth2_register(null, password, password, first_name, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.email[0]).to.eq('This field may not be null.')
    })
  })

  it('User should not be able to register with incorrect email', () => {
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`
    const incorrect_emails = ['incorrectemailgmail.com', '@smthgmail.com', 'testuser@gmail', '.testuser@gmail.com', 'tes@#$%^Y&Utu$ser@gmail.com']

    incorrect_emails.forEach(email => {
      request_auth2_register(email, password, password, first_name, last_name).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.email[0]).to.eq('Enter a valid email address.')
      })
    })
  })

  it('User should not be able to register without providing first name', () => {
    const email = email_helper.get_uniq_email();
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const last_name = `Dude${get_random_string_number(5)}`

    request_auth2_register(email, password, password, null, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.first_name[0]).to.eq('This field may not be null.')
    })
  })

  it('User should not be able to register without last name', () => {
    const email = email_helper.get_uniq_email();
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";

    request_auth2_register(email, password, password, first_name, null).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.last_name[0]).to.eq('This field may not be null.')
    })
  })

  it('User should not be able to register without password', () => {
    const email = email_helper.get_uniq_email();
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`

    request_auth2_register(email, null, null, first_name, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.password1[0]).to.eq('This field may not be null.')
      expect(response.body.errors.password2[0]).to.eq('This field may not be null.')
    })

    request_auth2_register(email, password, null, first_name, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.password2[0]).to.eq('This field may not be null.')
    })

    request_auth2_register(email, null, password, first_name, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.errors.password1[0]).to.eq('This field may not be null.')
    })
  })

  it('User should not be able to register without two different passwords', () => {
    const email = email_helper.get_uniq_email();
    const password_1 = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const password_2 = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`

    request_auth2_register(email, password_1, password_2, first_name, last_name).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body.message[0]).to.eq('The two password fields didn\'t match.')
    })
  })

  it(`User should not be able to register with password that doesn't meet acceptance criteria`, () => {
    const email = email_helper.get_uniq_email();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`
    const incorrect_passwords = new Map([
      ["This password is too short. It must contain at least 12 characters.", "1234^yG"],
      ["The password needs at least 1 number.", "asknndjasd^yG"],
      ["The password needs at least 1 special character.", "asknndjasd3yG"],
      ["The password needs at least 1 upper case.", "asknndjasd3yff@"],
      ["The password needs at least 1 lower case.", "ADJBFIW12$XAS"],
    ]);

    incorrect_passwords.forEach((value, key) => {
      request_auth2_register(email, value, value, first_name, last_name).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.errors.password1[0]).to.eq(key)
      })
    })
  })

  it('User should be able to register with valid data', () => {
    const email = email_helper.get_uniq_email();
    const password = Math.random().toString(36) + Math.random().toString(36).toUpperCase();
    const first_name = "Cypress";
    const last_name = `Dude${get_random_string_number(5)}`

    request_auth2_register(email, password, password, first_name, last_name).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.detail).to.eq('Verification e-mail sent.')
    })
  })
})

function request_auth2_register(email, password1, password2, first_name, last_name) {
  return cy.request({
    method: 'POST',
    failOnStatusCode: false,
    url: `https://meta.biapi.pro/auth2/register`,
    headers: {
      'content-type': 'application/json',
    },
    body: {
      email: email,
      password1: password1,
      password2: password2,
      first_name: first_name,
      last_name: last_name
    },
  })
}