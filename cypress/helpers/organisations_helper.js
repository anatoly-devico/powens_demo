export function create_organisation(name = 'SRT', country = 'af', size = '1', activity_area = "banking") {
  cy.getAllLocalStorage().then(resp => {
    const token = resp['https://console.budget-insight.com'].token
    cy.request({
      method: 'POST',
      url: `https://meta.biapi.pro/users/me/organizations`,
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
      },
      body: {
        name: name,
        country: country,
        size: size,
        activity_area: activity_area
      },
    })
  })
}