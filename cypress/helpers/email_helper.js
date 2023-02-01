import GuerrillaMailApi from 'guerrillamail-api';
import {get_random_string_number} from "./random_generator";

const GuerrillaApi = new GuerrillaMailApi({});

export class Email_helper {

  fetch_letter_by_subject(email, subject) {
    return new Promise((resolve, reject) => {
      GuerrillaApi.setEmailUser({email_user: email}).then(emailBox => {
        GuerrillaApi.getEmailList({offset: 0}).then(emailList => {
          if (JSON.parse(JSON.stringify(emailList)).count > 0) {
            this.get_email_id_by_subject(emailList, subject).then(emailId => {
              GuerrillaApi.fetchEmail(Number(emailId)).then(emailBody => {
                resolve(this.get_email_body(emailBody));
              });
            });
          }
        });
      });
    });
  };

  email_pool(emailUser, subject) {
    return cy.wrap(null, {log: false}).then({timeout: 60000}, async () => {
      let email;
      let i = 0;

      while (i < 35) {
        this.fetch_letter_by_subject(emailUser, subject).then((emailId) => {
          email = emailId;
        });
        await this.sleep(3000);
        i++;
        if (email != null) {
          break;
        }
      }
      if (!email)
        console.log('Email not found')
      return email;
    });
  }

  get_email_body(emailData) {
    return (JSON.parse(JSON.stringify(emailData)).mail_body);
  };

  get_email_id_by_subject(emailList, subject) {
    let trueEmailSubject = (JSON.parse(JSON.stringify(emailList)).list).filter(function (item) {
      return item.mail_subject === subject
    })
    return Promise.resolve(trueEmailSubject[0].mail_id);
  };

  get_activation_link(emailResponse) {
    return String(emailResponse.match(/(?<=href=")(.*)(?="><span style="font-size:18px;"><b>Activate my account<\/b>)/)[0]);
  }

  get_uniq_email() {
    return `cypress_dude${get_random_string_number(6)}@guerrillamailblock.com`
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const email_helper = new Email_helper();