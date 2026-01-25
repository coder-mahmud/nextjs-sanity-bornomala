'use server'

import MailerLite from '@mailerlite/mailerlite-nodejs';

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

export const subsCribeAction = async (email) => {

  const params = {
    email,
    fields: {
      // name: "Dummy",
      // last_name: "Testerson",
      // company: "MailerLite",
      // country: "Best country",
      // city: "Best city",
      // phone: "37060677606",
      // state: "Best state",
      // z_i_p: "99999"
    },
    groups: [`${process.env.MAILERLITE_GROUP_ID}`],
    status: "active", // possible statuses: active, unsubscribed, unconfirmed, bounced or junk.
    //subscribed_at: "2021-08-31 14:22:08",
    ip_address: null,
    opted_in_at: null, // yyyy-MM-dd HH:mm:ss
    optin_ip: null,
    unsubscribed_at: null // yyyy-MM-dd HH:mm:ss
  };
  
    mailerlite.subscribers.createOrUpdate(params)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        if (error.response) console.log(error.response.data);
    });

    // const apiRes = await fetch('https://connect.mailerlite.com/api/subscribers',{
    //   method:"POST",
    //   body: JSON.stringify(params),
    //   headers:{
    //     Authorization: `Bearer ${process.env.MAILERLITE_API_KEY!}`
    //   }
    // })

    // const data = await apiRes.json();
    // console.log("Data:",data)


  return true
}