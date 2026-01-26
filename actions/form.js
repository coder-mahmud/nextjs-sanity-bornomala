'use server'

import MailerLite from '@mailerlite/mailerlite-nodejs';

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

/*
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
        console.log("Response data:",response.data);
        return JSON.stringify(response.data)
      })
      .catch(error => {
        if (error.response) console.log(error.response.data);
        return JSON.stringify(error.response.data)
    });
  
}
*/

export const subsCribeAction = async (email) => {
  try {
    const params = {
      email,
      groups: [process.env.MAILERLITE_GROUP_ID],
      status: "active",
    };

    const response = await mailerlite.subscribers.createOrUpdate(params);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("MailerLite error:", error?.response?.data || error);

    return {
      success: false,
      error: error?.response?.data || "Something went wrong",
    };
  }
};



