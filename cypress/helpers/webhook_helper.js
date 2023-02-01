export function set_webhook_email(email, domain_id, token) {
  cy.request({
    method: 'POST',
    url: `https://meta.biapi.pro/domains/${domain_id}/config`,
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      "biapi.manager.email": email
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  })
}

export function enable_webhook(webhook_id, webhook_event, callback_url, domain_id, token) {
  cy.request({
    method: 'POST',
    url: `https://meta.biapi.pro/domains/${domain_id}/webhooks?expand=webhook_event`,
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      event: webhook_event
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  })

  cy.request({
    method: 'PUT',
    url: `https://meta.biapi.pro/domains/${domain_id}/webhooks/${webhook_id}?expand=webhook_event`,
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + token,
    },
    body: {
      url: callback_url
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
  })
}

export function get_creds_for_webhook_handling() {
  return cy.request({
    method: 'POST',
    url: 'https://webhook.site/token',
    headers: {
      'content-type': 'application/json',
    },
  }).then(resp => {
    return cy.wrap({
      uuid: resp.body.uuid,
      email: `${resp.body.uuid}@email.webhook.site`,
      url: `https://webhook.site/${resp.body.uuid}`
    })
  })
}

export function get_webhook_data(uuid) {
  return cy.request({
    method: 'GET',
    url: `https://webhook.site/token/${uuid}/requests`,
  })
}


export function wait_for_target_webhook(expected_attributes, uuid) {
  let target_webhook;
  let is_target_webhook_arrived = false;
  let actual_attributes
  const maxAttempts = 4;

  // for (let i = 0; i < maxAttempts; i++) {
  //   if (!is_target_webhook_arrived) {
      cy.wait(25000)
      get_webhook_data(uuid).then((webhook_data) => {
          try {
            cy.log('amount of wedhooks received: ' + webhook_data.body.data.length)
            for(let i = 0; i < webhook_data.body.data.length; i++){
              cy.log(`received webhook ${i+1}`)
              cy.log(webhook_data.body.data[i].content)
            }
          } catch (e) {
            // if (i === maxAttempts - 1)
            //   throw ('Error while fetching data from webhook.site')
            // return
          }
          // if (i !== maxAttempts - 1)
          //   check_entry(expected_attributes, actual_attributes, false)
          // else
          //   check_entry(expected_attributes, actual_attributes, true)
        }
      )
  //   }
  // }

  function check_entry(expected_attributes, actual_attributes, isLastAttempt) {
    let actual_attributes_string = JSON.stringify(actual_attributes)
    let count_of_passed_attr = 0
    Object.keys(expected_attributes).forEach((key) => {
      if (actual_attributes_string.includes(expected_attributes[key])) {
        count_of_passed_attr++;
      }
    })

    if (count_of_passed_attr === Object.keys(expected_attributes).length) {
      Object.keys(expected_attributes).forEach((key) => {
        expect(actual_attributes[key]).to.be.eq(expected_attributes[key])
      })
      target_webhook = actual_attributes;
      is_target_webhook_arrived = true;
    }

    if (isLastAttempt) {
      Object.keys(expected_attributes).forEach((key) => {
        expect(actual_attributes[key]).to.contain(expected_attributes[key])
      })
    }
  }

  return target_webhook;
}

